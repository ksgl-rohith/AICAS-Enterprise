import { NextRequest, NextResponse } from 'next/server';
import { durableWorkflowEngine } from '@/lib/workflow/durable-workflow-engine';
import '@/lib/workflow/workflows';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
    }

    const res = await durableWorkflowEngine.queryWorkflow(workflowId);
    return NextResponse.json({ success: true, workflow: res });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, workflowName, input, workflowId, signalName, signalPayload, reason } = body;

    if (action === 'start') {
      const res = await durableWorkflowEngine.startWorkflow(workflowName, input, { workflowId });
      return NextResponse.json({ success: true, workflow: res });
    }

    if (action === 'signal') {
      const res = await durableWorkflowEngine.signalWorkflow(workflowId, signalName, signalPayload);
      return NextResponse.json({ success: true, workflow: res });
    }

    if (action === 'cancel') {
      const res = await durableWorkflowEngine.cancelWorkflow(workflowId, reason);
      return NextResponse.json({ success: true, workflow: res });
    }

    if (action === 'retry') {
      const res = await durableWorkflowEngine.retryWorkflow(workflowId);
      return NextResponse.json({ success: true, workflow: res });
    }

    return NextResponse.json({ error: 'Invalid workflow action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
