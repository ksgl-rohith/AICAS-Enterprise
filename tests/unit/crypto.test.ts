import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState } from '../../src/lib/crypto';

describe('Encryption and OAuth Security Utilities', () => {
  it('should encrypt and decrypt access tokens correctly', () => {
    const rawToken = 'eaab_meta_secret_access_token_1234567890';
    const encrypted = encryptToken(rawToken);

    expect(encrypted).not.toEqual(rawToken);
    expect(encrypted).toContain('encryptedData');

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(rawToken);
  });

  it('should generate and verify OAuth state tokens', () => {
    const brandId = 'brand_123';
    const platform = 'linkedin';
    const state = generateOAuthState(brandId, platform);

    expect(state).toBeDefined();

    const verification = verifyOAuthState(state);
    expect(verification.valid).toBe(true);
    expect(verification.brandId).toEqual(brandId);
    expect(verification.platform).toEqual(platform);
  });

  it('should reject tampered or invalid OAuth state tokens', () => {
    const invalidState = 'invalid_tampered_state_string';
    const verification = verifyOAuthState(invalidState);
    expect(verification.valid).toBe(false);
  });
});
