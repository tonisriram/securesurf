import { useState } from "react";
import { Shield, Bug, Fish, Ban, Gamepad2, ShoppingCart, Dice5, Globe, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

const defaultCategories = [
  { id: "malware", icon: Bug, label: "Malware", desc: "Known malware distribution sites", enabled: true, color: "text-danger" },
  { id: "phishing", icon: Fish, label: "Phishing", desc: "Credential harvesting & impersonation", enabled: true, color: "text-warning" },
  { id: "adult", icon: Ban, label: "Adult Content", desc: "NSFW websites", enabled: false, color: "text-muted-foreground" },
  { id: "social", icon: Globe, label: "Social Media", desc: "Facebook, Instagram, Twitter, etc.", enabled: false, color: "text-accent" },
  { id: "gambling", icon: Dice5, label: "Gambling", desc: "Online betting and casino sites", enabled: false, color: "text-warning" },
  { id: "gaming", icon: Gamepad2, label: "Gaming", desc: "Online gaming platforms", enabled: false, color: "text-primary" },
  { id: "shopping", icon: ShoppingCart, label: "Shopping", desc: "E-commerce and retail sites", enabled: false, color: "text-accent" },
];

export default function BlockedSites() {
  const [categories, setCategories] = useState(defaultCategories);
  const [customDomains, setCustomDomains] = useState(["malicious-site.xyz", "phishing-example.com"]);
  const [newDomain, setNewDomain] = useState("");

  const toggleCategory = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  const addDomain = () => {
    if (newDomain.trim() && !customDomains.includes(newDomain.trim())) {
      setCustomDomains((prev) => [...prev, newDomain.trim()]);
      setNewDomain("");
    }
  };

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-2">Blocked Sites Manager</h1>
      <p className="text-muted-foreground mb-8">Configure which categories of websites to block automatically.</p>

      {/* Categories */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggleCategory(cat.id)}
            className={`p-5 rounded-2xl bg-card border cursor-pointer transition-all duration-200 ${
              cat.enabled ? "border-primary/40 glow-primary" : "border-border hover:border-border/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.enabled ? "bg-primary/10" : "bg-secondary"}`}>
                  <cat.icon className={`w-5 h-5 ${cat.enabled ? cat.color : "text-muted-foreground"}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">{cat.label}</div>
                  <div className="text-xs text-muted-foreground">{cat.desc}</div>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${cat.enabled ? "bg-primary" : "bg-secondary"}`}>
                <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${cat.enabled ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Domains */}
      <h2 className="text-xl font-display font-semibold mb-4">Custom Block List</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDomain()}
          placeholder="example.com"
          className="flex-1 h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
        />
        <button onClick={addDomain} className="px-4 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {customDomains.map((d) => (
          <div key={d} className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border">
            <span className="font-mono text-sm">{d}</span>
            <button onClick={() => setCustomDomains((prev) => prev.filter((x) => x !== d))} className="text-muted-foreground hover:text-danger transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
