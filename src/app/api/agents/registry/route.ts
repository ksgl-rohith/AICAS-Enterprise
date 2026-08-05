import { NextResponse } from 'next/server';
import { agentRegistry } from '@/lib/ai/agent-registry';

export async function GET() {
  try {
    const agents = agentRegistry.listAgents();
    return NextResponse.json({
      success: true,
      totalRegistered: agents.length,
      agents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list agent registry' },
      { status: 500 }
    );
  }
}
