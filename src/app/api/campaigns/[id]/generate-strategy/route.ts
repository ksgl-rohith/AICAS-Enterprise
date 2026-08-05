import { db } from '@/lib/db';
import { strategyAgent } from '@/lib/ai/strategy-agent';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: params.id },
      include: { brand: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const taskId = `task_strat_${campaign.id}_${Date.now()}`;
    const channels = campaign.channels.split(',').map((c) => c.trim().toLowerCase());

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
      return NextResponse.json({ error: 'Strategy generation failed', details: result.warnings }, { status: 500 });
    }

    const stratOutput = result.output;

    // Save Strategy to DB
    const strategyRecord = await db.campaignStrategy.upsert({
      where: { campaignId: campaign.id },
      update: {
        objectiveInterpretation: stratOutput.objectiveInterpretation,
        audienceSummary: stratOutput.audienceSummary,
        campaignNarrative: stratOutput.campaignNarrative,
        contentPillarsJson: JSON.stringify(stratOutput.contentPillars),
        channelRolesJson: JSON.stringify(stratOutput.channelRoles),
        publishingCadence: stratOutput.publishingCadence,
        contentIdeasJson: JSON.stringify(stratOutput.contentIdeas),
        constraintsJson: JSON.stringify(stratOutput.constraints),
        retrievedEvidenceJson: JSON.stringify(result.evidence),
      },
      create: {
        campaignId: campaign.id,
        objectiveInterpretation: stratOutput.objectiveInterpretation,
        audienceSummary: stratOutput.audienceSummary,
        campaignNarrative: stratOutput.campaignNarrative,
        contentPillarsJson: JSON.stringify(stratOutput.contentPillars),
        channelRolesJson: JSON.stringify(stratOutput.channelRoles),
        publishingCadence: stratOutput.publishingCadence,
        contentIdeasJson: JSON.stringify(stratOutput.contentIdeas),
        constraintsJson: JSON.stringify(stratOutput.constraints),
        retrievedEvidenceJson: JSON.stringify(result.evidence),
      },
    });

    // Update campaign status
    await db.campaign.update({
      where: { id: campaign.id },
      data: { status: 'STRATEGY_GENERATED' },
    });

    // Log Agent Run
    await db.agentRun.create({
      data: {
        taskId,
        agentName: 'StrategyAgent',
        status: result.status,
        inputSummary: `Campaign: ${campaign.name}`,
        outputSummary: `Generated ${stratOutput.contentPillars.length} pillars & ${stratOutput.contentIdeas.length} content ideas.`,
        confidence: result.confidence,
        warningsJson: JSON.stringify(result.warnings),
        latencyMs: result.usage?.latencyMs || 0,
        modelName: result.provenance?.model || 'gemini-2.5-flash',
      },
    });

    // Log Audit Event
    await db.auditEvent.create({
      data: {
        userId: campaign.brand.userId,
        brandId: campaign.brandId,
        campaignId: campaign.id,
        action: 'STRATEGY_GENERATED',
        details: `StrategyAgent generated strategy narrative with ${stratOutput.contentPillars.length} pillars.`,
        entityType: 'CampaignStrategy',
        entityId: strategyRecord.id,
      },
    });

    return NextResponse.json({
      success: true,
      strategy: strategyRecord,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
