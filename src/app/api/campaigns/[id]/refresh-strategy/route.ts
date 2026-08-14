import { db } from '@/lib/db';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { auditService } from '@/lib/services/audit-service';
import { getSessionFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    const userId = session?.userId || 'SYSTEM';

    const body = await req.json().catch(() => ({}));
    const { feedback, feedbackCategories, selectiveRefresh } = body;

    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: { brand: true, strategy: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const currentVersion = campaign.strategy ? campaign.strategy.version + 1 : 1;
    const taskId = `task_strat_refresh_${campaign.id}_${Date.now()}`;
    const channels = campaign.channels.split(',').map((c) => c.trim().toLowerCase());

    // Record audit: strategy.feedback.submitted
    if (feedback && feedback.trim().length > 0) {
      await auditService.recordEvent({
        tenantId: 'tenant-default',
        brandId: campaign.brandId,
        campaignId: campaign.id,
        category: 'Campaign',
        action: 'strategy.feedback.submitted',
        details: `User submitted feedback for Strategy revision v${currentVersion}: "${feedback.slice(0, 100)}"`,
        entityType: 'CampaignStrategy',
        entityId: campaign.strategy?.id || campaign.id,
        metadata: {
          feedback,
          categories: feedbackCategories || [],
          version: currentVersion,
          userId,
        },
      });
    }

    // Record audit: strategy.intelligence.refresh.requested
    await auditService.recordEvent({
      tenantId: 'tenant-default',
      brandId: campaign.brandId,
      campaignId: campaign.id,
      category: 'Campaign',
      action: 'strategy.intelligence.refresh.requested',
      details: `Intelligence refresh requested for Campaign '${campaign.name}' (v${currentVersion}).`,
      entityType: 'CampaignStrategy',
      entityId: campaign.strategy?.id || campaign.id,
      metadata: {
        selectiveRefresh: selectiveRefresh || { all: true },
        hasFeedback: Boolean(feedback),
        userId,
      },
    });

    // Execute Strategy Agent with latest social metrics, trends, and feedback
    const result = await strategyAgent.execute({
      taskId,
      tenantId: 'tenant-default',
      brandId: campaign.brandId,
      campaignId: campaign.id,
      input: {
        campaignId: campaign.id,
        brandId: campaign.brandId,
        name: campaign.name,
        objective: campaign.objective,
        productOrTopic: campaign.productOrTopic,
        targetAudience: campaign.targetAudience,
        offerCTA: campaign.offerCTA,
        channels,
        requiredMessages: campaign.requiredMessages || undefined,
        prohibitedThemes: campaign.prohibitedThemes || undefined,
        userFeedback: feedback || undefined,
        feedbackCategories: feedbackCategories || undefined,
        previousStrategy: campaign.strategy ? {
          objectiveInterpretation: campaign.strategy.objectiveInterpretation,
          audienceSummary: campaign.strategy.audienceSummary,
          campaignNarrative: campaign.strategy.campaignNarrative,
          contentPillars: JSON.parse(campaign.strategy.contentPillarsJson || '[]'),
          channelRoles: JSON.parse(campaign.strategy.channelRolesJson || '{}'),
          publishingCadence: campaign.strategy.publishingCadence,
        } : undefined,
        rerunMarketResearch: selectiveRefresh?.marketResearch,
        rerunTrendIntelligence: selectiveRefresh?.trendIntelligence,
        rerunForecasting: selectiveRefresh?.forecasting,
        rerunBrandContext: selectiveRefresh?.brandContext,
      },
    });

    if (result.status === 'failed' || !result.output) {
      return NextResponse.json({ error: 'Strategy refresh failed', details: result.warnings }, { status: 500 });
    }

    const stratOutput = result.output;

    // Retrieve existing revision history or initialize
    let revisionsHistory: any[] = [];
    if (campaign.strategy?.constraintsJson) {
      try {
        const parsed = JSON.parse(campaign.strategy.constraintsJson);
        if (Array.isArray(parsed._revisions)) {
          revisionsHistory = parsed._revisions;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (stratOutput.revisionSummary) {
      revisionsHistory.push({
        version: currentVersion,
        ...stratOutput.revisionSummary,
      });
    }

    const constraintsWithHistory = [
      ...stratOutput.constraints,
    ];

    // Upsert strategy version
    const updatedStrategy = await db.campaignStrategy.upsert({
      where: { campaignId: campaign.id },
      update: {
        version: currentVersion,
        status: campaign.status === 'STRATEGY_APPROVED' ? 'APPROVED' : 'DRAFT',
        objectiveInterpretation: stratOutput.objectiveInterpretation,
        audienceSummary: stratOutput.audienceSummary,
        campaignNarrative: stratOutput.campaignNarrative,
        contentPillarsJson: JSON.stringify(stratOutput.contentPillars),
        channelRolesJson: JSON.stringify(stratOutput.channelRoles),
        publishingCadence: stratOutput.publishingCadence,
        contentIdeasJson: JSON.stringify(stratOutput.contentIdeas),
        constraintsJson: JSON.stringify(constraintsWithHistory),
        retrievedEvidenceJson: JSON.stringify(result.evidence),
        sourceFreshnessJson: JSON.stringify({
          sources: stratOutput.sourceFreshness || [],
          revisionSummary: stratOutput.revisionSummary || null,
          history: revisionsHistory,
        }),
        confidence: result.confidence,
        limitations: (stratOutput.limitations || []).join('; '),
      },
      create: {
        campaignId: campaign.id,
        version: 1,
        status: 'DRAFT',
        objectiveInterpretation: stratOutput.objectiveInterpretation,
        audienceSummary: stratOutput.audienceSummary,
        campaignNarrative: stratOutput.campaignNarrative,
        contentPillarsJson: JSON.stringify(stratOutput.contentPillars),
        channelRolesJson: JSON.stringify(stratOutput.channelRoles),
        publishingCadence: stratOutput.publishingCadence,
        contentIdeasJson: JSON.stringify(stratOutput.contentIdeas),
        constraintsJson: JSON.stringify(constraintsWithHistory),
        retrievedEvidenceJson: JSON.stringify(result.evidence),
        sourceFreshnessJson: JSON.stringify({
          sources: stratOutput.sourceFreshness || [],
          revisionSummary: stratOutput.revisionSummary || null,
          history: revisionsHistory,
        }),
        confidence: result.confidence,
        limitations: (stratOutput.limitations || []).join('; '),
      },
    });

    // Record audit: strategy.revision.generated
    await auditService.recordEvent({
      tenantId: 'tenant-default',
      brandId: campaign.brandId,
      campaignId: campaign.id,
      category: 'Campaign',
      action: 'strategy.revision.generated',
      details: `Generated strategy revision v${currentVersion} with ${stratOutput.contentPillars.length} content pillars.`,
      entityType: 'CampaignStrategy',
      entityId: updatedStrategy.id,
      metadata: {
        version: currentVersion,
        confidence: result.confidence,
        revisionSummary: stratOutput.revisionSummary,
        sourceFreshness: stratOutput.sourceFreshness,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      strategy: updatedStrategy,
      revisionSummary: stratOutput.revisionSummary,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Strategy refresh failed' }, { status: 500 });
  }
}
