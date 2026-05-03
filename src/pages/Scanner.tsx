import { useState } from "react";
import { Search, Shield, Globe, Lock, AlertTriangle, CheckCircle, XCircle, Brain, Server, FileText, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ThreatGauge from "@/components/ThreatGauge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { generateMockScanResult, type ScanResult } from "@/lib/heuristics";
import { generateScanReport } from "@/lib/generateReport";
import { supabase } from "@/integrations/supabase/client";

const demoUrls = [
  { url: "https://google.com", label: "Safe" },
  { url: "http://192.168.1.1/login/verify-account", label: "Suspicious" },
  { url: "http://paypal-secure-login.suspicious-site.com/verify", label: "Dangerous" },
];

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [meta, setMeta] = useState<{ confidence?: number; cached?: boolean; breakdown?: Array<{ source: string; score: number; weight: number; available: boolean; contribution: number }> } | null>(null);

  const handleScan = async (targetUrl?: string) => {
    const scanUrl = targetUrl || url;
    if (!scanUrl.trim()) return;
    setResult(null);
    setScanning(true);

    // Build local heuristic + mock infrastructure result first
    const baseResult = generateMockScanResult(scanUrl);

    try {
      const { data, error } = await supabase.functions.invoke("scan-url", {
        body: { url: scanUrl },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Merge AI assessment with heuristic/mock data (AI takes priority on score + explanation)
      const recommendationFor = (status: string) =>
        status === "safe"
          ? "✅ Safe to visit — no threats detected."
          : status === "warning"
          ? "⚠️ Proceed with caution — avoid entering sensitive data."
          : "🚫 Block immediately — do not visit this website.";

      const merged: ScanResult = {
        ...baseResult,
        threatScore: data.score ?? baseResult.threatScore,
        status: data.status ?? baseResult.status,
        aiExplanation: data.explanation ?? baseResult.aiExplanation,
        aiRecommendation: recommendationFor(data.status ?? baseResult.status),
        heuristics: [
          ...baseResult.heuristics,
          ...(data.signals ?? []).map((s: string) => ({
            name: s,
            description: `AI-detected signal (${data.category})`,
            severity:
              data.status === "danger" ? ("danger" as const) : data.status === "warning" ? ("warning" as const) : ("safe" as const),
            score: 0,
          })),
        ],
      };
      setResult(merged);
      setMeta({ confidence: data.confidence, cached: data.cached, breakdown: data.breakdown });

      // Persist to scan_history (anon = null user_id)
      try {
        const { data: auth } = await supabase.auth.getUser();
        await supabase.from("scan_history").insert({
          user_id: auth.user?.id ?? null,
          url: scanUrl,
          score: data.score ?? merged.threatScore,
          status: data.status ?? merged.status,
          category: data.category ?? null,
          explanation: data.explanation ?? merged.aiExplanation,
          signals: data.signals ?? [],
          ai_used: data.ai_used ?? false,
        });
      } catch (logErr) {
        console.warn("Could not save scan to history", logErr);
      }
    } catch (err: any) {
      console.error("AI scan failed:", err);
      toast.error("AI scan unavailable — showing heuristic-only results", {
        description: err?.message ?? "Edge function error",
      });
      setResult(baseResult);
    } finally {
      setScanning(false);
    }
  };

  const statusConfig = {
    safe: { icon: CheckCircle, color: "text-safe", bg: "bg-safe/10", border: "border-safe/30", label: "SAFE" },
    warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", label: "WARNING" },
    danger: { icon: XCircle, color: "text-danger", bg: "bg-danger/10", border: "border-danger/30", label: "DANGEROUS" },
  };

  return (
    <div className="container py-12 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">URL Scanner</h1>
        <p className="text-muted-foreground">Enter a URL to analyze for threats</p>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Sparkles className="w-3 h-3" /> Powered by Gemini AI
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          placeholder="https://example.com"
          className="w-full h-14 pl-12 pr-32 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
        />
        <button
          onClick={() => handleScan()}
          disabled={scanning}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition disabled:opacity-50"
        >
          {scanning ? "Scanning..." : "Scan"}
        </button>
      </div>

      {/* Demo URLs */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        <span className="text-xs text-muted-foreground mr-1 self-center">Try:</span>
        {demoUrls.map((d) => (
          <button
            key={d.url}
            onClick={() => { setUrl(d.url); handleScan(d.url); }}
            className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-mono hover:bg-secondary/80 transition border border-border"
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Scanning animation */}
      <AnimatePresence>
        {scanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6" />
            <p className="text-muted-foreground animate-pulse">Gemini AI is analyzing the URL across multiple threat signals...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !scanning && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score + Status */}
            <div className="p-8 rounded-2xl bg-card border border-border text-center">
              <ThreatGauge score={result.threatScore} />
              <div className="mt-4">
                {(() => {
                  const cfg = statusConfig[result.status];
                  return (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bg} ${cfg.border} border ${cfg.color} font-bold text-sm`}>
                      <cfg.icon className="w-4 h-4" /> {cfg.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-mono break-all">{result.url}</p>
              <button
                onClick={() => generateScanReport(result)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 border border-border transition"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </button>
            </div>

            {/* AI Explanation */}
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-semibold">AI Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{result.aiExplanation}</p>
              <p className="text-sm font-semibold">{result.aiRecommendation}</p>
            </div>

            {/* Confidence + Evidence Breakdown */}
            {meta?.breakdown && (
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold">Evidence Breakdown</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {meta.cached && (
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">Cached</span>
                    )}
                    <span className="text-muted-foreground">
                      Confidence: <span className="font-semibold text-foreground">{meta.confidence ?? 0}%</span>
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {meta.breakdown.map((b) => (
                    <div key={b.source}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={b.available ? "text-foreground" : "text-muted-foreground line-through"}>
                          {b.source} <span className="text-muted-foreground">· weight {Math.round(b.weight * 100)}%</span>
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {b.available ? `${b.score}/100` : "unavailable"}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full ${b.score >= 60 ? "bg-danger" : b.score >= 30 ? "bg-warning" : "bg-safe"}`}
                          style={{ width: `${b.available ? b.score : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score Breakdown */}
            <ScoreBreakdown result={result} />

            <div className="grid md:grid-cols-2 gap-6">
              {/* Heuristic Analysis */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Heuristic Analysis</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.heuristics.map((h, i) => {
                    const colors = {
                      safe: "bg-safe/10 text-safe border-safe/20",
                      warning: "bg-warning/10 text-warning border-warning/20",
                      danger: "bg-danger/10 text-danger border-danger/20",
                    };
                    return (
                      <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${colors[h.severity]}`} title={h.description}>
                        {h.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* API Intelligence */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="w-5 h-5 text-accent" />
                  <h3 className="font-display font-semibold">API Intelligence</h3>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const sb = (result as any).safe_browsing as
                      | { checked: boolean; listed: boolean; threats: string[] }
                      | undefined;
                    const sbDetail = !sb || !sb.checked
                      ? "Unavailable"
                      : sb.listed
                      ? sb.threats.join(", ")
                      : "Clean";
                    const sbFlagged = !!sb?.listed;
                    return (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Google Safe Browsing</span>
                        <span className={`text-xs ${sbFlagged ? "text-danger" : sb?.checked ? "text-safe" : "text-muted-foreground"}`}>
                          {sbDetail}
                        </span>
                      </div>
                    );
                  })()}
                  {(() => {
                    const vt = (result as any).virus_total as
                      | { checked: boolean; found: boolean; malicious: number; suspicious: number; harmless: number }
                      | undefined;
                    const flagged = !!vt && (vt.malicious + vt.suspicious) > 0;
                    const detail = !vt || !vt.checked
                      ? "Unavailable"
                      : !vt.found
                      ? "Not in database"
                      : flagged
                      ? `${vt.malicious} malicious / ${vt.suspicious} suspicious`
                      : "Clean";
                    return (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">VirusTotal</span>
                        <span className={`text-xs ${flagged ? "text-danger" : vt?.checked && vt?.found ? "text-safe" : "text-muted-foreground"}`}>
                          {detail}
                        </span>
                      </div>
                    );
                  })()}
                  {[
                    { name: "PhishTank", detail: result.apiIntel.phishTank.detail, flagged: result.apiIntel.phishTank.listed },
                    { name: "MalwareBazaar", detail: result.apiIntel.malwareBazaar.detail, flagged: result.apiIntel.malwareBazaar.listed },
                  ].map((api) => (
                    <div key={api.name} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{api.name}</span>
                      <span className={`text-xs ${api.flagged ? "text-danger" : "text-safe"}`}>{api.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain Intelligence */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Domain Intelligence</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {Object.entries(result.domainInfo).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-mono text-xs">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HTTPS Certificate */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">HTTPS Certificate</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issuer</span>
                    <span className="font-mono text-xs">{result.httpsInfo.issuer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiry</span>
                    <span className="font-mono text-xs">{result.httpsInfo.expiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade</span>
                    <span className={`font-bold ${result.httpsInfo.grade === "A+" ? "text-safe" : "text-danger"}`}>{result.httpsInfo.grade}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
