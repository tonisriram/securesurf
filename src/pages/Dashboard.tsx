import { BarChart3, Shield, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

const stats = [
  { icon: BarChart3, label: "Total Scans", value: "12,847", change: "+12%", color: "text-primary" },
  { icon: Shield, label: "Threats Detected", value: "1,293", change: "+5%", color: "text-danger" },
  { icon: AlertTriangle, label: "Sites Blocked", value: "847", change: "+8%", color: "text-warning" },
  { icon: Activity, label: "Alerts Fired", value: "156", change: "-3%", color: "text-accent" },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  scans: Math.floor(Math.random() * 500 + 100),
  threats: Math.floor(Math.random() * 50),
}));

const categoryData = [
  { name: "Phishing", value: 42, color: "hsl(0, 72%, 55%)" },
  { name: "Malware", value: 28, color: "hsl(35, 92%, 55%)" },
  { name: "Scam", value: 18, color: "hsl(200, 80%, 55%)" },
  { name: "Adult", value: 8, color: "hsl(280, 60%, 55%)" },
  { name: "Other", value: 4, color: "hsl(220, 14%, 40%)" },
];

const recentThreats = [
  { url: "http://paypal-verify.malicious.com", score: 92, type: "Phishing", time: "2 min ago" },
  { url: "http://free-iphone-winner.xyz", score: 85, type: "Scam", time: "5 min ago" },
  { url: "http://download-crack.ru/setup.exe", score: 96, type: "Malware", time: "12 min ago" },
  { url: "http://banking-secure-update.com", score: 78, type: "Phishing", time: "18 min ago" },
  { url: "http://crypto-earn-fast.io", score: 71, type: "Scam", time: "25 min ago" },
];

export default function Dashboard() {
  return (
    <div className="container py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time threat monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-safe/10 border border-safe/20 text-safe text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          System Active
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-card border border-border card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-xs text-safe flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.change}
              </span>
            </div>
            <div className="text-2xl font-display font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* 24hr chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
          <h3 className="font-display font-semibold mb-4">24-Hour Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="hour" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} interval={3} />
              <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="scans" fill="hsl(165, 80%, 48%)" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="threats" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="font-display font-semibold mb-4">Threat Categories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </div>
                <span className="text-muted-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Threat Feed */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-display font-semibold mb-4">Live Threat Feed</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">URL</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentThreats.map((t, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 font-mono text-xs max-w-[300px] truncate">{t.url}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${t.score > 80 ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                      {t.score}
                    </span>
                  </td>
                  <td className="py-3 text-xs">{t.type}</td>
                  <td className="py-3 text-xs text-muted-foreground">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
