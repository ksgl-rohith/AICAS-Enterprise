import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'tenant-default';

    const records = await db.costUsageRecord.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const budget = await db.costBudget.findUnique({ where: { tenantId } });

    // Aggregate FREE Usage
    const freeRecords = records.filter((r) => r.billingClass === 'FREE');
    const freeRequests = freeRecords.length;
    const freeTokens = freeRecords.reduce((acc, r) => acc + r.inputTokens + r.outputTokens, 0);

    // Aggregate PAID Usage
    const paidRecords = records.filter((r) => r.billingClass === 'PAID');
    const paidRequests = paidRecords.length;
    const paidTokens = paidRecords.reduce((acc, r) => acc + r.inputTokens + r.outputTokens, 0);
    const paidSpendUsd = paidRecords.reduce((acc, r) => acc + r.estimatedCostUsd, 0);

    return NextResponse.json({
      summary: {
        totalRequests: records.length,
        totalTokens: freeTokens + paidTokens,
        totalSpendUsd: paidSpendUsd,
        monthlyBudgetUsd: budget?.monthlyBudgetUsd || 500.0,
      },
      freeUsage: {
        requests: freeRequests,
        tokens: freeTokens,
        estimatedCostUsd: 0.0,
        modelsUsed: Array.from(new Set(freeRecords.map((r) => r.modelName))),
      },
      paidUsage: {
        requests: paidRequests,
        tokens: paidTokens,
        spendUsd: paidSpendUsd,
        modelsUsed: Array.from(new Set(paidRecords.map((r) => r.modelName))),
      },
      records,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch cost governance metrics' }, { status: 500 });
  }
}
