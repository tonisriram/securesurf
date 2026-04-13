import { useState } from "react";
import { Download, Filter, Search } from "lucide-react";

const mockLogs = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  url: [
    "https://google.com",
    "http://paypal-verify.evil.com",
    "https://github.com",
    "http://192.168.1.1/admin",
    "http://free-prize.xyz",
    "https://amazon.com",
    "http://banking-update.scam.ru",
  ][i % 7],
  score: [8, 92, 5, 65, 88, 3, 95][i % 7],
  result: (["safe", "danger", "safe", "warning", "danger", "safe", "danger"] as const)[i % 7],
  timestamp: new Date(Date.now() - i * 300000).toISOString(),
}));

export default function Logs() {
  const [filter, setFilter] = useState<"all" | "safe" | "warning" | "danger">("all");
  const [search, setSearch] = useState("");

  const filtered = mockLogs.filter((log) => {
    if (filter !== "all" && log.result !== filter) return false;
    if (search && !log.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportCsv = () => {
    const csv = "URL,Score,Result,Timestamp\n" + filtered.map((l) => `"${l.url}",${l.score},${l.result},${l.timestamp}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "securesurf-logs.csv";
    a.click();
  };

  const resultColors = {
    safe: "bg-safe/10 text-safe",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <div className="container py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Scan Logs</h1>
          <p className="text-muted-foreground text-sm">History of all scanned URLs</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 border border-border transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search URLs..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "safe", "warning", "danger"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition ${
                filter === f ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">URL</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Result</th>
                <th className="px-5 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">{log.id}</td>
                  <td className="px-5 py-3 font-mono text-xs max-w-[300px] truncate">{log.url}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.score > 70 ? "bg-danger/10 text-danger" : log.score > 30 ? "bg-warning/10 text-warning" : "bg-safe/10 text-safe"}`}>
                      {log.score}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${resultColors[log.result]}`}>{log.result}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
