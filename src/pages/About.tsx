import { Shield, Brain, Server, Globe, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";

const layers = [
  { icon: Brain, title: "Machine Learning", desc: "Random Forest model trained on millions of URLs to detect phishing patterns, suspicious domain structures, and malware indicators." },
  { icon: Shield, title: "Heuristic Analysis", desc: "Rule-based engine analyzing URL length, special characters, HTTPS usage, IP-based URLs, subdomain depth, and phishing keywords." },
  { icon: Server, title: "Threat Intelligence APIs", desc: "Real-time cross-referencing with PhishTank, VirusTotal, and MalwareBazaar for comprehensive threat coverage." },
  { icon: Globe, title: "Browser Extension", desc: "Chrome/Edge extension captures visited URLs in real time, providing instant protection with visual threat indicators." },
];

export default function About() {
  return (
    <div className="container py-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          About SecureSurf
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">Protecting Users from Online Threats</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          SecureSurf is a real-time malicious website detection and blocking system that combines artificial intelligence, heuristic analysis, and global threat intelligence to protect users from phishing, malware, and unsafe websites.
        </p>
      </motion.div>

      <div className="mb-16">
        <h2 className="text-2xl font-display font-bold text-center mb-8">Multi-Layer Defense Architecture</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {layers.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <l.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{l.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-primary/20 text-center">
        <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold mb-3">Why Cybersecurity Matters</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Over 3.4 billion phishing emails are sent daily. Cybercrime costs are projected to reach $10.5 trillion annually by 2025. 
          SecureSurf empowers users with AI-driven protection so they can browse the web with confidence.
        </p>
      </div>
    </div>
  );
}
