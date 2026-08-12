import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { brandDNARepository } from '@/lib/brand/brand-dna-repository';

describe('Brand DNA Auto-Suggestions & Precedence Hierarchy', () => {
  let brandId: string;

  beforeEach(async () => {
    const user = await db.user.findFirst();
    const brand = await db.brand.create({
      data: {
        userId: user?.id || 'usr_1',
        name: 'OmniHealth Solutions',
        industry: 'Healthcare Technology',
        description: 'OmniHealth provides enterprise patient management and telehealth platforms.',
        products: 'OmniCare Telehealth, OmniPatient Portal, OmniAnalytics',
        targetAudience: 'Chief Medical Officers, Hospital Administrators, Telehealth Directors',
        defaultCTA: 'Schedule a Healthcare Platform Demo',
        personality: 'Authoritative & Compassionate',
        tone: 'Professional & Compassionate',
        preferredVocabulary: 'Telehealth, Patient Care',
        prohibitedPhrases: 'Magic cure',
        requiredDisclaimers: 'Medical consultation required.',
      },
    });
    brandId = brand.id;
  });

  it('enforces HUMAN_CONFIRMED precedence over AI extractions', () => {
    const existingField = {
      value: 'OmniHealth Enterprise',
      source: 'HUMAN_CONFIRMED' as const,
      updatedAt: new Date().toISOString(),
    };

    const incomingAiField = {
      value: 'OmniHealth AI',
      source: 'AI_EXTRACTED' as const,
      updatedAt: new Date().toISOString(),
    };

    const resolved = brandDNARepository.resolvePrecedence(existingField, incomingAiField);

    expect(resolved.value).toBe('OmniHealth Enterprise');
    expect(resolved.source).toBe('HUMAN_CONFIRMED');
  });

  it('allows AI_EXTRACTED field when no HUMAN_CONFIRMED value exists', () => {
    const incomingAiField = {
      value: 'OmniHealth AI',
      source: 'AI_EXTRACTED' as const,
      updatedAt: new Date().toISOString(),
    };

    const resolved = brandDNARepository.resolvePrecedence(undefined, incomingAiField);

    expect(resolved.value).toBe('OmniHealth AI');
    expect(resolved.source).toBe('AI_EXTRACTED');
  });
});
