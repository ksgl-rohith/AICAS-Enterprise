import { describe, it, expect } from 'vitest';

function checkProhibitedPhrases(text: string, prohibited: string[]): string[] {
  const textLower = text.toLowerCase();
  return prohibited.filter((phrase) => phrase && textLower.includes(phrase.toLowerCase()));
}

function checkDisclaimers(text: string, required: string[]): string[] {
  const textLower = text.toLowerCase();
  return required.filter((disclaimer) => disclaimer && !textLower.includes(disclaimer.toLowerCase().slice(0, 20)));
}

describe('Prohibited Phrase and Compliance Guardrails', () => {
  it('should detect prohibited phrases in content text', () => {
    const text = 'Get Guaranteed 1000% ROI with our new Magic AI content generator!';
    const prohibited = ['Guaranteed 1000% ROI', 'Magic AI', 'Zero Effort'];
    const found = checkProhibitedPhrases(text, prohibited);

    expect(found).toContain('Guaranteed 1000% ROI');
    expect(found).toContain('Magic AI');
    expect(found).not.toContain('Zero Effort');
  });

  it('should identify missing required disclaimers', () => {
    const text = 'ApexAI provides enterprise multi-agent workflows for content automation.';
    const required = ['Results may vary based on enterprise architecture and data governance readiness.'];
    const missing = checkDisclaimers(text, required);

    expect(missing).toHaveLength(1);
    expect(missing[0]).toContain('Results may vary');
  });
});
