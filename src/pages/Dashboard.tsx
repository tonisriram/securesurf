import { useEffect, useMemo, useState } from "react";
import { BarChart3, Shield, AlertTriangle, Activity, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type Scan = {
  id: string;
  url: string;
  score: number;
  status: "safe" | "warning" | "danger";
  category: string | null;
  created_at: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  phishing: "hsl(0, 72%, 55%)",
  malware: "hsl(35, 92%, 55%)",
  scam: "hsl(200, 80%, 55%)",
  adult: "hsl(280, 60%, 55%)",
  safe: "hsl(165, 80%, 48%)",
  other: "hsl(220, 14%, 40%)",
};

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function Dashboard() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setAuthed(!!auth.user);
      if (!auth.user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("scan_history")
        .select("id, url, score, status, category, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      setScans((data as Scan[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = scans.length;
    const threats = scans.filter((s) => s.status !== "safe").length;
    const blocked = scans.filter((s) => s.status === "danger").length;
    const warnings = scans.filter((s) => s.status === "warning").length;
    return [
      { icon: BarChart3, label: "Total Scans", value: total, color: "text-primary" },
      { icon: Shield, label: "Threats Detected", value: threats, color: "text-danger" },
      { icon: AlertTriangle, label: "Sites Blocked", value: blocked, color: "text-warning" },
      { icon: Activity, label: "Warnings", value: warnings, color: "text-accent" },
    ];
  }, [scans]);

  const dailyData = useMemo(() => {
    const days: { date: string; scans: number; threats: number }[] = [];
    const map = new Map<string, { scans: number; threats: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { scans: 0, threats: 0 });
    }
    for (const s of scans) {
      const key = s.created_at.slice(0, 10);
      const e = map.get(key);
      if (e) {
        e.scans++;
        if (s.status !== "safe") e.threats++;
      }
    }
    map.forEach((v, k) => {
      const d = new Date(k);
      days.push({ date: d.toLocaleDateString(undefined, { weekday: "short" }), ...v });
    });
    return days;
  }, [scans]);

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of scans) {
      const c = (s.category || "other").toLowerCase();
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[name] ?? CATEGORY_COLORS.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [scans]);

  const topDomains = useMemo(() => {
    const map = new Map<string, { domain: string; count: number; maxScore: number; lastSeen: string }>();
    for (const s of scans.filter((s) => s.status !== "safe")) {
      const d = getDomain(s.url);
      const e = map.get(d);
      if (e) {
        e.count++;
        e.maxScore = Math.max(e.maxScore, s.score);
        if (s.created_at > e.lastSeen) e.lastSeen = s.created_at;
      } else {
        map.set(d, { domain: d, count: 1, maxScore: s.score, lastSeen: s.created_at });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.maxScore - a.maxScore).slice(0, 5);
  }, [scans]);

  if (authed === false) {
    return (
      <div className="container py-12 max-w-3xl">
        <div className="p-10 rounded-2xl bg-card border border-border text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-4">Sign in to see your scan analytics.</p>
          <Link to="/login" className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin inline text-muted-foreground" />
        </div>
      ) : scans.length === 0 ? (
        <div className="p-10 rounded-2xl bg-card border border-border text-center">
          <p className="text-muted-foreground mb-4">No scans yet.</p>
          <Link to="/scanner" className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition">
            Run your first scan
          </Link>
        </div>
      ) : (
        <>
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
                </div>
                <div className="text-2xl font-display font-bold">{s.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-4">Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="scans" fill="hsl(165, 80%, 48%)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="threats" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-4">Threat Categories</h3>
              {categoryData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No data</p>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-display font-semibold mb-4">Top Dangerous Domains</h3>
            {topDomains.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No threats detected yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-3 font-medium">Domain</th>
                      <th className="pb-3 font-medium">Max Score</th>
                      <th className="pb-3 font-medium">Hits</th>
                      <th className="pb-3 font-medium">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDomains.map((d) => (
                      <tr key={d.domain} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 font-mono text-xs max-w-[300px] truncate">{d.domain}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${d.maxScore > 60 ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                            {d.maxScore}
                          </span>
                        </td>
                        <td className="py-3 text-xs">{d.count}</td>
                        <td className="py-3 text-xs text-muted-foreground">{new Date(d.lastSeen).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
