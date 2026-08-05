'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, RefreshCw, Send, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<{ [id: string]: boolean }>({});
  const [triggeringDue, setTriggeringDue] = useState(false);

  // New Schedule Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('linkedin');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 16));

  const fetchData = () => {
    Promise.all([
      fetch('/api/schedules').then((res) => res.json()),
      fetch('/api/approvals').then((res) => res.json()),
    ])
      .then(([schedData, appData]) => {
        setSchedules(Array.isArray(schedData) ? schedData : []);
        setApprovedItems(
          Array.isArray(appData) ? appData.filter((i: any) => i.status === 'APPROVED' || i.status === 'SCHEDULED') : []
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      alert('Please select an approved content item.');
      return;
    }

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentItemId: selectedItemId,
          channel: selectedChannel,
          scheduledTime: new Date(scheduledDate).toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        alert(data.error || 'Schedule collision or error creating schedule.');
      }
    } catch {
      alert('Failed to schedule post.');
    }
  };

  const handlePublishNow = async (contentItemId: string, channel: string, scheduleId?: string) => {
    setPublishing({ ...publishing, [contentItemId]: true });
    try {
      const res = await fetch('/api/publishing/publish-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentItemId, channel, scheduleId }),
      });

      const data = await res.json();
      if (res.ok) {
        const permalink = data.result?.permalink || data.publication?.permalink;
        if (permalink) {
          window.open(permalink, '_blank', 'noopener,noreferrer');
        }
        alert(`Published successfully! Mode: ${data.result?.isSimulated ? 'Simulated Sandbox' : 'Live API'}. Post ID: ${data.result?.externalPostId}`);
        fetchData();
      } else {
        alert(data.error || 'Publishing failed.');
      }
    } catch {
      alert('Publishing request error.');
    } finally {
      setPublishing({ ...publishing, [contentItemId]: false });
    }
  };

  const handleTriggerDue = async () => {
    setTriggeringDue(true);
    try {
      const res = await fetch('/api/publishing/trigger-due', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Processed ${data.processedCount || 0} due scheduled publications.`);
        fetchData();
      }
    } catch {
      alert('Failed to trigger due schedules.');
    } finally {
      setTriggeringDue(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publishing Operations"
        title="Calendar & Schedule Orchestration"
        description="Cadence and timezone-aware publishing schedule. Dispatch through live API connectors or simulated sandbox."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaign Operations' },
          { label: 'Calendar & Schedule' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerDue}
              disabled={triggeringDue}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${triggeringDue ? 'animate-spin' : ''}`} />
              <span>Process Scheduled Posts</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Approved Post</span>
            </button>
          </div>
        }
      />

      {/* Schedule Items Agenda Feed */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Scheduled Publishing Queue ({schedules.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Timezone: UTC</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading scheduled publications...</div>
        ) : schedules.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No Posts Scheduled"
            description="There are currently no content posts scheduled in the queue."
            action={
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" /> Schedule Approved Content
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {schedules.map((s) => {
              const isPublished = s.status === 'PUBLISHED';
              return (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{s.channel}</Badge>
                      <h4 className="font-bold text-slate-900 dark:text-white">{s.contentItem?.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Scheduled Slot: <strong className="text-slate-800 dark:text-slate-200">{new Date(s.scheduledTime).toLocaleString()}</strong> • Campaign:{' '}
                      <strong className="text-purple-600 dark:text-purple-400">{s.campaign?.name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={isPublished ? 'emerald' : 'amber'}>{s.status}</Badge>

                    {isPublished ? (
                      s.publications?.[0]?.permalink && (
                        <a
                          href={s.publications[0].permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Post</span>
                        </a>
                      )
                    ) : (
                      <button
                        onClick={() => handlePublishNow(s.contentItemId, s.channel, s.id)}
                        disabled={publishing[s.contentItemId]}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{publishing[s.contentItemId] ? 'Publishing...' : 'Publish Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Approved Post</h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Approved Content Item *</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Item --</option>
                  {approvedItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.campaign?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Social Channel</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook Page</option>
                  <option value="instagram">Instagram Feed</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date & Time (UTC)</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
