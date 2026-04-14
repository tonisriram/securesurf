import { Chrome, Download, Shield, Zap, Eye, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: Eye, title: "Real-Time Scanning", desc: "Automatically scans every URL you visit" },
  { icon: Shield, title: "Instant Protection", desc: "Blocks malicious sites before they load" },
  { icon: Zap, title: "Threat Popup", desc: "Shows threat score & AI explanation in popup" },
  { icon: AlertTriangle, title: "Warning Page", desc: "Redirects dangerous URLs to a warning page" },
];

const steps = [
  { num: "1", title: "Download", desc: "Download the extension ZIP file" },
  { num: "2", title: "Unzip", desc: "Extract the downloaded ZIP file" },
  { num: "3", title: "Load", desc: "Open chrome://extensions, enable Developer mode, click 'Load unpacked'" },
  { num: "4", title: "Browse", desc: "The extension now protects you automatically" },
];

export default function Extension() {
  const [connectionStatus] = useState<"connected" | "disconnected">("disconnected");
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Extension Package",
      description: "The browser extension will be available for download when the backend is connected via Lovable Cloud.",
    });
  };

  return (
    <div className="container py-12 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Chrome className="w-4 h-4" />
          Browser Extension
        </div>
        <h1 className="text-4xl font-display font-bold mb-3">SecureSurf Extension</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Real-time protection for Chrome, Edge, Brave, and all Chromium browsers. Scans every URL automatically.
        </p>
      </motion.div>

      {/* Connection Status */}
      <div className="p-6 rounded-2xl bg-card border border-border mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-display font-semibold text-sm">Extension Status</h3>
              <p className="text-xs text-muted-foreground">Connection to SecureSurf backend</p>
            </div>
          </div>
          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            connectionStatus === "connected"
              ? "bg-safe/10 text-safe border border-safe/20"
              : "bg-secondary text-muted-foreground border border-border"
          }`}>
            <div className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-safe animate-pulse" : "bg-muted-foreground"}`} />
            {connectionStatus === "connected" ? "Connected" : "Not Connected"}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-card border border-border card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Download */}
      <div className="text-center mb-12">
        <button onClick={handleDownload} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition glow-primary">
          <Download className="w-5 h-5" /> Download Extension
        </button>
        <p className="text-xs text-muted-foreground mt-3">Manifest V3 · Chrome/Edge/Brave · ~50KB</p>
      </div>

      {/* Setup Steps */}
      <div className="mb-12">
        <h2 className="text-2xl font-display font-bold text-center mb-8">Installation Steps</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-card border border-border text-center">
              <div className="text-3xl font-display font-black text-primary/30 mb-2">{s.num}</div>
              <h3 className="font-display font-semibold mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Extension Preview */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-primary/20">
        <h2 className="text-xl font-display font-bold text-center mb-6">Extension Popup Preview</h2>
        <div className="max-w-xs mx-auto rounded-2xl bg-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-sm text-gradient-primary">SecureSurf</span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-center mb-3">
              <div className="text-4xl font-display font-bold text-safe">12</div>
              <div className="text-xs text-muted-foreground">Threat Score</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-safe/10 border border-safe/20 text-safe text-xs font-medium mb-3">
              <CheckCircle className="w-3 h-3" /> Safe to browse
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">This website is verified safe. No phishing, malware, or suspicious patterns detected.</p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-1.5 rounded-lg bg-secondary text-xs font-medium text-center">Trust</button>
              <button className="flex-1 py-1.5 rounded-lg bg-secondary text-xs font-medium text-center">Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
