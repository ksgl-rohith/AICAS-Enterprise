import { db } from '@/lib/db';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { auditService } from '@/lib/services/audit-service';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
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

    // Execute Strategy Agent with latest social metrics & trends
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
      },
    });

    if (result.status === 'failed' || !result.output) {
      return NextResponse.json({ error: 'Strategy refresh failed', details: result.warnings }, { status: 500 });
    }

    const stratOutput = result.output;

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
        constraintsJson: JSON.stringify(stratOutput.constraints),
        retrievedEvidenceJson: JSON.stringify(result.evidence),
        sourceFreshnessJson: JSON.stringify(stratOutput.sourceFreshness || []),
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
        constraintsJson: JSON.stringify(stratOutput.constraints),
        retrievedEvidenceJson: JSON.stringify(result.evidence),
        sourceFreshnessJson: JSON.stringify(stratOutput.sourceFreshness || []),
        confidence: result.confidence,
        limitations: (stratOutput.limitations || []).join('; '),
      },
    });

    // Record Audit Log
    await auditService.recordEvent({
      tenantId: 'tenant-default',
      brandId: campaign.brandId,
      campaignId: campaign.id,
      category: 'Campaign',
      action: 'strategy.refreshed',
      details: `Refreshed strategy to version ${currentVersion} using latest brand & market intelligence.`,
      entityType: 'CampaignStrategy',
      entityId: updatedStrategy.id,
      metadata: {
        version: currentVersion,
        confidence: result.confidence,
        sourceFreshness: stratOutput.sourceFreshness,
      },
    });

    return NextResponse.json({
      success: true,
      strategy: updatedStrategy,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Strategy refresh failed' }, { status: 500 });
  }
}
