import { useState } from "react";
import { Shield, Settings, Activity, Users, ToggleLeft, Server, AlertTriangle, CheckCircle, Database, Wifi } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { id: "rules", label: "Blocking Rules", icon: Shield },
  { id: "api", label: "API Config", icon: Server },
  { id: "health", label: "System Health", icon: Activity },
  { id: "users", label: "User Management", icon: Users },
  { id: "features", label: "Feature Toggles", icon: ToggleLeft },
];

const blockingRules = [
  { id: 1, pattern: "*.suspicious-site.com", type: "Domain", action: "Block", enabled: true },
  { id: 2, pattern: "/verify-account", type: "Path", action: "Warn", enabled: true },
  { id: 3, pattern: "*.xyz", type: "TLD", action: "Warn", enabled: false },
  { id: 4, pattern: "IP-based URLs", type: "Heuristic", action: "Block", enabled: true },
  { id: 5, pattern: "*.ru/*.exe", type: "Pattern", action: "Block", enabled: true },
];

const apiConfigs = [
  { name: "VirusTotal", status: "active", key: "VT-****-****-abc", rateLimit: "4 req/min", usage: "2,847/10,000" },
  { name: "PhishTank", status: "active", key: "PT-****-****-def", rateLimit: "30 req/min", usage: "12,400/50,000" },
  { name: "MalwareBazaar", status: "warning", key: "MB-****-****-ghi", rateLimit: "10 req/min", usage: "9,200/10,000" },
];

const healthMetrics = [
  { name: "API Server", status: "healthy", uptime: "99.97%", latency: "42ms", icon: Server },
  { name: "ML Model", status: "healthy", uptime: "99.99%", latency: "28ms", icon: Database },
  { name: "Threat DB", status: "healthy", uptime: "99.95%", latency: "15ms", icon: Shield },
  { name: "WebSocket", status: "degraded", uptime: "98.5%", latency: "120ms", icon: Wifi },
];

const featureToggles = [
  { id: "ai_scan", label: "AI-Powered Scanning", desc: "Use ML model for URL analysis", enabled: true },
  { id: "realtime", label: "Real-time Monitoring", desc: "Live dashboard updates", enabled: true },
  { id: "auto_block", label: "Auto-Block High Risk", desc: "Block URLs with score > 80 automatically", enabled: true },
  { id: "email_alerts", label: "Email Alerts", desc: "Send email on critical threats", enabled: false },
  { id: "sandbox", label: "Safe Preview Sandbox", desc: "Preview suspicious sites safely", enabled: false },
  { id: "dark_mode", label: "Dark Mode", desc: "Dark color scheme (always on)", enabled: true },
];

const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@securesurf.io", role: "admin", scans: 1240, lastActive: "2 min ago" },
  { id: 2, name: "Jane Doe", email: "jane@example.com", role: "user", scans: 342, lastActive: "1 hr ago" },
  { id: 3, name: "Bob Smith", email: "bob@example.com", role: "user", scans: 89, lastActive: "3 hrs ago" },
  { id: 4, name: "Alice", email: "alice@test.com", role: "moderator", scans: 567, lastActive: "15 min ago" },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("rules");
  const [features, setFeatures] = useState(featureToggles);

  const toggleFeature = (id: string) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  return (
    <div className="container py-12 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">System configuration & monitoring</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Blocking Rules */}
      {activeTab === "rules" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold">Active Blocking Rules</h3>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition">+ Add Rule</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3">Pattern</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Status</th>
            </tr></thead>
            <tbody>
              {blockingRules.map((rule) => (
                <tr key={rule.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-5 py-3 font-mono text-xs">{rule.pattern}</td>
                  <td className="px-5 py-3 text-xs">{rule.type}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-1 rounded-md text-xs font-medium ${rule.action === "Block" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>{rule.action}</span></td>
                  <td className="px-5 py-3"><span className={`text-xs ${rule.enabled ? "text-safe" : "text-muted-foreground"}`}>{rule.enabled ? "Active" : "Disabled"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* API Config */}
      {activeTab === "api" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {apiConfigs.map((api) => (
            <div key={api.name} className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">{api.name}</h3>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${api.status === "active" ? "text-safe" : "text-warning"}`}>
                  <div className={`w-2 h-2 rounded-full ${api.status === "active" ? "bg-safe" : "bg-warning"} animate-pulse`} />
                  {api.status === "active" ? "Connected" : "Near Limit"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground text-xs">API Key</span><p className="font-mono text-xs mt-1">{api.key}</p></div>
                <div><span className="text-muted-foreground text-xs">Rate Limit</span><p className="text-xs mt-1">{api.rateLimit}</p></div>
                <div><span className="text-muted-foreground text-xs">Usage</span><p className="text-xs mt-1">{api.usage}</p></div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* System Health */}
      {activeTab === "health" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-4">
          {healthMetrics.map((m) => (
            <div key={m.name} className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <m.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">{m.name}</h3>
                </div>
                {m.status === "healthy" ? (
                  <CheckCircle className="w-5 h-5 text-safe" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Uptime</span><p className="font-mono mt-0.5">{m.uptime}</p></div>
                <div><span className="text-muted-foreground">Latency</span><p className="font-mono mt-0.5">{m.latency}</p></div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Scans</th><th className="px-5 py-3">Last Active</th>
            </tr></thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-5 py-3"><div className="font-medium text-sm">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></td>
                  <td className="px-5 py-3"><span className={`px-2 py-1 rounded-md text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : u.role === "moderator" ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>{u.role}</span></td>
                  <td className="px-5 py-3 text-xs">{u.scans}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Feature Toggles */}
      {activeTab === "features" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {features.map((f) => (
            <div key={f.id} onClick={() => toggleFeature(f.id)}
              className={`p-5 rounded-2xl bg-card border cursor-pointer transition-all ${f.enabled ? "border-primary/40" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{f.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${f.enabled ? "bg-primary" : "bg-secondary"}`}>
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${f.enabled ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
