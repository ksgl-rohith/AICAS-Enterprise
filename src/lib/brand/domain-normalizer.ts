export interface NormalizedDomainResult {
  originalWebsiteUrl: string;
  canonicalWebsiteUrl: string;
  normalizedDomain: string;
}

export class DomainNormalizer {
  public static normalize(inputUrl?: string | null): NormalizedDomainResult | null {
    if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.trim()) {
      return null;
    }

    const trimmed = inputUrl.trim();
    let urlString = trimmed;
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = `https://${urlString}`;
    }

    try {
      const parsed = new URL(urlString);
      let hostname = parsed.hostname.toLowerCase().trim();

      // Remove www. prefix if present
      if (hostname.startsWith('www.')) {
        hostname = hostname.slice(4);
      }

      // Canonical URL format: https://domain.com
      const canonicalWebsiteUrl = `${parsed.protocol}//${hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
      const normalizedDomain = hostname;

      return {
        originalWebsiteUrl: trimmed,
        canonicalWebsiteUrl,
        normalizedDomain,
      };
    } catch {
      return null;
    }
  }
}
