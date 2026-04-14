import { useState } from "react";
import { Search, Shield, Globe, Lock, AlertTriangle, CheckCircle, XCircle, Brain, Server, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThreatGauge from "@/components/ThreatGauge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { generateMockScanResult, type ScanResult } from "@/lib/heuristics";
import { generateScanReport } from "@/lib/generateReport";

const demoUrls = [
  { url: "https://google.com", label: "Safe" },
  { url: "http://192.168.1.1/login/verify-account", label: "Suspicious" },
  { url: "http://paypal-secure-login.suspicious-site.com/verify", label: "Dangerous" },
];

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async (targetUrl?: string) => {
    const scanUrl = targetUrl || url;
    if (!scanUrl.trim()) return;
    setResult(null);
    setScanning(true);
    await new Promise((r) => setTimeout(r, 1800));
    setResult(generateMockScanResult(scanUrl));
    setScanning(false);
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
            <p className="text-muted-foreground animate-pulse">Analyzing URL across multiple threat databases...</p>
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
                  {[
                    { name: "PhishTank", detail: result.apiIntel.phishTank.detail, flagged: result.apiIntel.phishTank.listed },
                    { name: "VirusTotal", detail: result.apiIntel.virusTotal.detail, flagged: result.apiIntel.virusTotal.positives > 3 },
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
