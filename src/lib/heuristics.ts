export interface HeuristicResult {
  name: string;
  description: string;
  severity: "safe" | "warning" | "danger";
  score: number; // contribution to threat score
}

export interface ScanResult {
  url: string;
  threatScore: number;
  status: "safe" | "warning" | "danger";
  heuristics: HeuristicResult[];
  aiExplanation: string;
  aiRecommendation: string;
  domainInfo: {
    ip: string;
    geolocation: string;
    domainAge: string;
    registrar: string;
    redirects: number;
    serverType: string;
  };
  httpsInfo: {
    issuer: string;
    expiry: string;
    grade: string;
    valid: boolean;
  };
  apiIntel: {
    phishTank: { listed: boolean; detail: string };
    virusTotal: { positives: number; total: number; detail: string };
    malwareBazaar: { listed: boolean; detail: string };
  };
  timestamp: string;
}

export function analyzeUrl(url: string): HeuristicResult[] {
  const results: HeuristicResult[] = [];

  try {
    const parsed = new URL(url);

    // HTTPS check
    if (parsed.protocol !== "https:") {
      results.push({ name: "No HTTPS", description: "Site does not use encrypted connection", severity: "danger", score: 15 });
    } else {
      results.push({ name: "HTTPS Enabled", description: "Site uses encrypted connection", severity: "safe", score: 0 });
    }

    // URL length
    if (url.length > 100) {
      results.push({ name: "Long URL", description: `URL is ${url.length} characters — unusually long`, severity: "warning", score: 10 });
    }

    // IP-based URL
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname)) {
      results.push({ name: "IP-Based URL", description: "Uses IP address instead of domain name", severity: "danger", score: 20 });
    }

    // Special characters in URL
    const specialCount = (url.match(/[@!#$%^&*()=\[\]{}|\\;:'",<>?]/g) || []).length;
    if (specialCount > 3) {
      results.push({ name: "Suspicious Characters", description: `Contains ${specialCount} special characters`, severity: "warning", score: 8 });
    }

    // Subdomain count
    const subdomains = parsed.hostname.split(".").length - 2;
    if (subdomains > 2) {
      results.push({ name: "Excessive Subdomains", description: `${subdomains} subdomains detected`, severity: "warning", score: 10 });
    }

    // Suspicious keywords
    const suspiciousWords = ["login", "verify", "secure", "account", "update", "confirm", "banking", "paypal", "signin"];
    const foundWords = suspiciousWords.filter((w) => url.toLowerCase().includes(w));
    if (foundWords.length > 1) {
      results.push({ name: "Phishing Keywords", description: `Contains: ${foundWords.join(", ")}`, severity: "danger", score: 15 });
    }

    // Hyphen abuse
    if ((parsed.hostname.match(/-/g) || []).length > 3) {
      results.push({ name: "Hyphen Abuse", description: "Domain has excessive hyphens", severity: "warning", score: 8 });
    }

    // Known safe domains
    const safeDomains = ["google.com", "github.com", "microsoft.com", "apple.com", "amazon.com", "wikipedia.org"];
    if (safeDomains.some((d) => parsed.hostname.endsWith(d))) {
      results.push({ name: "Known Domain", description: "Domain is widely recognized and trusted", severity: "safe", score: -20 });
    }
  } catch {
    results.push({ name: "Invalid URL", description: "URL format is not valid", severity: "danger", score: 25 });
  }

  return results;
}

export function computeThreatScore(heuristics: HeuristicResult[]): number {
  const raw = heuristics.reduce((sum, h) => sum + h.score, 0);
  return Math.max(0, Math.min(100, 20 + raw)); // base score of 20
}

export function generateMockScanResult(url: string): ScanResult {
  const heuristics = analyzeUrl(url);
  const threatScore = computeThreatScore(heuristics);
  const status = threatScore <= 30 ? "safe" : threatScore <= 70 ? "warning" : "danger";

  const isHttps = url.startsWith("https");

  return {
    url,
    threatScore,
    status,
    heuristics,
    aiExplanation: getAiExplanation(url, threatScore, status),
    aiRecommendation: getAiRecommendation(status),
    domainInfo: {
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      geolocation: ["United States", "Germany", "Netherlands", "Singapore", "Russia", "China"][Math.floor(Math.random() * 6)],
      domainAge: `${Math.floor(Math.random() * 3650)} days`,
      registrar: ["GoDaddy", "Namecheap", "Cloudflare", "Google Domains"][Math.floor(Math.random() * 4)],
      redirects: Math.floor(Math.random() * 4),
      serverType: ["nginx", "Apache", "cloudflare", "Microsoft-IIS"][Math.floor(Math.random() * 4)],
    },
    httpsInfo: {
      issuer: isHttps ? "Let's Encrypt Authority X3" : "N/A",
      expiry: isHttps ? "2026-08-15" : "N/A",
      grade: isHttps ? "A+" : "F",
      valid: isHttps,
    },
    apiIntel: {
      phishTank: { listed: threatScore > 60, detail: threatScore > 60 ? "Found in PhishTank database" : "Not listed" },
      virusTotal: { positives: Math.floor(threatScore / 15), total: 72, detail: `${Math.floor(threatScore / 15)}/72 engines flagged` },
      malwareBazaar: { listed: threatScore > 80, detail: threatScore > 80 ? "Malware distribution detected" : "Clean" },
    },
    timestamp: new Date().toISOString(),
  };
}

function getAiExplanation(url: string, score: number, status: string): string {
  if (status === "safe") {
    return `This URL appears to be safe. The domain is well-established, uses HTTPS encryption, and shows no signs of phishing or malware activity. Our analysis found no suspicious patterns in the URL structure.`;
  }
  if (status === "warning") {
    return `This URL shows some potentially suspicious characteristics. While it may be legitimate, we detected unusual patterns such as ${score > 50 ? "multiple subdomains and suspicious keywords" : "an unusually long URL structure"}. Exercise caution before entering personal information.`;
  }
  return `⚠️ HIGH RISK: This URL exhibits multiple characteristics commonly associated with phishing and malware distribution. The URL structure contains suspicious patterns, and threat intelligence databases have flagged similar domains. We strongly recommend avoiding this website.`;
}

function getAiRecommendation(status: string): string {
  if (status === "safe") return "✅ Safe to visit — no threats detected.";
  if (status === "warning") return "⚠️ Proceed with caution — avoid entering sensitive data.";
  return "🚫 Block immediately — do not visit this website.";
}
