import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const publications = await db.publication.findMany();

    const createdSnapshots = [];
    for (const pub of publications) {
      const isReal = pub.publishingMode === 'live';
      const baseMult = isReal ? 1.5 : 1.0;

      const snapshot = await db.metricsSnapshot.create({
        data: {
          publicationId: pub.id,
          channel: pub.channel,
          isReal,
          impressions: Math.floor((3000 + Math.random() * 8000) * baseMult),
          reach: Math.floor((2400 + Math.random() * 6000) * baseMult),
          engagements: Math.floor((200 + Math.random() * 700) * baseMult),
          clicks: Math.floor((50 + Math.random() * 200) * baseMult),
          saves: Math.floor((20 + Math.random() * 80) * baseMult),
          shares: Math.floor((10 + Math.random() * 45) * baseMult),
          conversions: Math.floor((3 + Math.random() * 15) * baseMult),
          engagementRate: parseFloat((5.0 + Math.random() * 3.5).toFixed(2)),
          snapshotDate: new Date(),
        },
      });

      createdSnapshots.push(snapshot);
    }

    return NextResponse.json({
      success: true,
      count: createdSnapshots.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
