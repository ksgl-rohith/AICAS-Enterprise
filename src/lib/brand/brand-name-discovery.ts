export interface BrandIdentityEvidence {
  sourceUrl: string;
  type: 'meta_og_site_name' | 'meta_app_name' | 'json_ld_org' | 'title_tag' | 'header_logo_alt' | 'footer_copyright' | 'h1_heading' | 'domain_fallback';
  value: string;
  confidence: number;
}

export interface BrandIdentityResult {
  brandName: string;
  confidence: number;
  evidence: BrandIdentityEvidence[];
  isLowConfidence: boolean;
}

export class BrandNameDiscovery {
  /**
   * Safely normalize a hostname URL, removing www. or m. prefixes
   */
  public normalizeDomain(inputUrl: string): { hostname: string; rootDomain: string; primaryLabel: string } {
    let rawUrl = inputUrl.trim();
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = `https://${rawUrl}`;
    }

    try {
      const parsed = new URL(rawUrl);
      let hostname = parsed.hostname.toLowerCase();
      
      // Strip common prefixes
      hostname = hostname.replace(/^(www\.|m\.)/i, '');
      
      const parts = hostname.split('.').filter(Boolean);
      let primaryLabel = parts[0] || 'brand';

      // Capitalize first letter cleanly
      primaryLabel = primaryLabel.charAt(0).toUpperCase() + primaryLabel.slice(1);

      return {
        hostname,
        rootDomain: parts.slice(-2).join('.'),
        primaryLabel,
      };
    } catch {
      return { hostname: 'unknown.com', rootDomain: 'unknown.com', primaryLabel: 'Brand' };
    }
  }

  /**
   * Discover brand name from multiple priority evidence signals
   */
  public discoverBrandIdentity(
    inputUrl: string,
    html: string,
    titleTag: string,
    metaDescription: string
  ): BrandIdentityResult {
    const evidenceList: BrandIdentityEvidence[] = [];
    const domainInfo = this.normalizeDomain(inputUrl);

    // 1. Check OpenGraph og:site_name
    const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
    if (ogSiteMatch && ogSiteMatch[1].trim()) {
      evidenceList.push({
        sourceUrl: inputUrl,
        type: 'meta_og_site_name',
        value: ogSiteMatch[1].trim(),
        confidence: 0.96,
      });
    }

    // 2. Check application-name metadata
    const appNameMatch = html.match(/<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']+)["']/i);
    if (appNameMatch && appNameMatch[1].trim()) {
      evidenceList.push({
        sourceUrl: inputUrl,
        type: 'meta_app_name',
        value: appNameMatch[1].trim(),
        confidence: 0.94,
      });
    }

    // 3. Check JSON-LD Organization schema
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const block of jsonLdMatches) {
        try {
          const content = block.replace(/<[^>]+>/g, '').trim();
          const parsedJson = JSON.parse(content);
          const orgName = parsedJson.name || parsedJson.legalName || (parsedJson['@type'] === 'Organization' && parsedJson.name);
          if (orgName && typeof orgName === 'string') {
            evidenceList.push({
              sourceUrl: inputUrl,
              type: 'json_ld_org',
              value: orgName.trim(),
              confidence: 0.98,
            });
            break;
          }
        } catch {
          // ignore malformed JSON-LD
        }
      }
    }

    // 4. Header logo alt text
    const logoAltMatch = html.match(/<img[^>]*alt=["']([^"']*(?:logo|brand|company)[^"']*)["'][^>]*>/i);
    if (logoAltMatch && logoAltMatch[1].trim()) {
      const cleanedAlt = logoAltMatch[1].replace(/\blogo\b|\bbrand\b/gi, '').trim();
      if (cleanedAlt) {
        evidenceList.push({
          sourceUrl: inputUrl,
          type: 'header_logo_alt',
          value: cleanedAlt,
          confidence: 0.88,
        });
      }
    }

    // 5. Footer copyright string
    const copyrightMatch = html.match(/(?:copyright|©|\&copy;)\s*(?:\d{4})?\s*([A-Za-z0-9\s,\.\-&]{3,40})/i);
    if (copyrightMatch && copyrightMatch[1].trim()) {
      const cleanCopyright = copyrightMatch[1].replace(/All rights reserved.*/i, '').trim();
      if (cleanCopyright && !cleanCopyright.toLowerCase().includes('inc') === false || cleanCopyright.length < 35) {
        evidenceList.push({
          sourceUrl: inputUrl,
          type: 'footer_copyright',
          value: cleanCopyright,
          confidence: 0.85,
        });
      }
    }

    // 6. Title tag parser (e.g. "Policybazaar - Health & Life Insurance" -> "Policybazaar")
    if (titleTag && titleTag.trim()) {
      const titleParts = titleTag.split(/[-|–:•]/).map((p) => p.trim()).filter(Boolean);
      if (titleParts.length > 0) {
        const candidate = titleParts[0];
        if (candidate.length > 1 && candidate.length < 40) {
          evidenceList.push({
            sourceUrl: inputUrl,
            type: 'title_tag',
            value: candidate,
            confidence: 0.90,
          });
        }
      }
    }

    // 7. Domain name fallback (NEVER 'www'!)
    evidenceList.push({
      sourceUrl: inputUrl,
      type: 'domain_fallback',
      value: domainInfo.primaryLabel,
      confidence: 0.60,
    });

    // Select highest confidence non-empty brand name
    evidenceList.sort((a, b) => b.confidence - a.confidence);
    const topEvidence = evidenceList[0];
    const brandName = topEvidence ? topEvidence.value : domainInfo.primaryLabel;
    const confidence = topEvidence ? topEvidence.confidence : 0.60;

    return {
      brandName,
      confidence,
      evidence: evidenceList,
      isLowConfidence: confidence < 0.75,
    };
  }
}

export const brandNameDiscovery = new BrandNameDiscovery();
