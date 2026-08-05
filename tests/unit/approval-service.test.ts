import { describe, it, expect } from 'vitest';
import { evaluateApprovalPolicy } from '../../src/lib/approval/approval-service';

describe('Approval Policy & Oversight Evaluation', () => {
  it('should trigger mandatory human approval for medical or financial claims', () => {
    const resMedical = evaluateApprovalPolicy({
      riskScore: 10,
      factualConfidence: 0.9,
      brandDnaScore: 90,
      text: 'FDA approved treatment cures chronic symptoms.',
    });
    expect(resMedical.mandatoryApproval).toBe(true);
    expect(resMedical.mandatoryReason).toContain('Medical claim');

    const resFinancial = evaluateApprovalPolicy({
      riskScore: 10,
      factualConfidence: 0.9,
      brandDnaScore: 90,
      text: 'Our product guarantees returns of 45% annually.',
    });
    expect(resFinancial.mandatoryApproval).toBe(true);
    expect(resFinancial.mandatoryReason).toContain('Financial promise');
  });
});
