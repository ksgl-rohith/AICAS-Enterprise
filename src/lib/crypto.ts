import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = Buffer.from(
  (process.env.PLATFORM_TOKEN_ENCRYPTION_KEY || '39f847291a58c40b2e3194a8f9021c4b').slice(0, 32),
  'utf-8'
);

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export function encryptToken(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return JSON.stringify({
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
  });
}

export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return '';
  try {
    const payload: EncryptedPayload = JSON.parse(encryptedString);
    const iv = Buffer.from(payload.iv, 'hex');
    const authTag = Buffer.from(payload.authTag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(payload.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return '';
  }
}

export function generateOAuthState(brandId: string, platform: string): string {
  const secret = process.env.OAUTH_STATE_SECRET || 'aicas_default_state_secret';
  const timestamp = Date.now().toString();
  const raw = `${brandId}:${platform}:${timestamp}:${secret}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return Buffer.from(`${brandId}:${platform}:${timestamp}:${hash}`).toString('base64url');
}

export function verifyOAuthState(state: string): { valid: boolean; brandId?: string; platform?: string } {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return { valid: false };
    const [brandId, platform, timestamp, hash] = parts;
    const secret = process.env.OAUTH_STATE_SECRET || 'aicas_default_state_secret';
    
    // Validate timestamp age (max 15 mins)
    if (Date.now() - parseInt(timestamp, 10) > 15 * 60 * 1000) {
      return { valid: false };
    }

    const expectedHash = crypto
      .createHash('sha256')
      .update(`${brandId}:${platform}:${timestamp}:${secret}`)
      .digest('hex');

    if (hash !== expectedHash) return { valid: false };
    return { valid: true, brandId, platform };
  } catch {
    return { valid: false };
  }
}
