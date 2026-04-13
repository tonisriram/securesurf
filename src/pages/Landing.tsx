import { Link } from "react-router-dom";
import { Shield, Search, Zap, Lock, BarChart3, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Search, title: "AI-Powered Scanning", desc: "Advanced machine learning analyzes URLs for phishing, malware, and suspicious patterns in real time." },
  { icon: Shield, title: "Real-Time Protection", desc: "Browser extension monitors every URL you visit and blocks threats before they reach you." },
  { icon: Zap, title: "Instant Results", desc: "Get comprehensive threat analysis with detailed explanations in under 2 seconds." },
  { icon: Lock, title: "HTTPS Inspection", desc: "Verify SSL certificates, encryption grades, and connection security automatically." },
  { icon: BarChart3, title: "Threat Intelligence", desc: "Cross-references PhishTank, VirusTotal, and MalwareBazaar databases in real time." },
  { icon: Globe, title: "Domain Analysis", desc: "Deep inspection of domain age, WHOIS data, geolocation, and redirect chains." },
];

const steps = [
  { num: "01", title: "Scan", desc: "Enter any URL or let our extension scan automatically" },
  { num: "02", title: "Analyze", desc: "AI + heuristics + threat APIs evaluate the URL" },
  { num: "03", title: "Protect", desc: "Get a threat score, explanation, and recommendation" },
];

const stats = [
  { value: "10M+", label: "URLs Scanned" },
  { value: "99.7%", label: "Detection Rate" },
  { value: "<1s", label: "Avg Scan Time" },
  { value: "50K+", label: "Threats Blocked" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              AI-Powered Cybersecurity
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black leading-tight mb-6">
              Browse the Web{" "}
              <span className="text-gradient-hero">Fearlessly</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              SecureSurf detects and blocks phishing, malware, and unsafe websites using AI, heuristic analysis, and real-time threat intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/scanner"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition glow-primary"
              >
                Scan a URL Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition border border-border"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
              <div className="text-3xl font-display font-black text-gradient-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold mb-3">Comprehensive Protection</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Multi-layered defense combining AI, heuristics, and global threat databases.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-card border border-border card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-card/30 border-y border-border">
        <div className="container py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to stay protected</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
                <div className="text-5xl font-display font-black text-primary/20 mb-4">{s.num}</div>
                <h3 className="text-xl font-display font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-primary/20"
        >
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-3">Start Protecting Yourself Today</h2>
          <p className="text-muted-foreground mb-8">Scan your first URL in seconds — no account required.</p>
          <Link
            to="/scanner"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition glow-primary"
          >
            Open Scanner <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-gradient-primary">SecureSurf</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SecureSurf. Stay safe online.</p>
        </div>
      </footer>
    </div>
  );
}
