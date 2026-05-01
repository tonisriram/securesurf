import { useEffect, useState } from "react";
import { Download, Search, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type LogRow = {
  id: string;
  url: string;
  score: number;
  status: "safe" | "warning" | "danger";
  category: string | null;
  created_at: string;
};

export default function Logs() {
  const [filter, setFilter] = useState<"all" | "safe" | "warning" | "danger">("all");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    setAuthed(!!auth.user);
    if (!auth.user) {
      setLogs([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("scan_history")
      .select("id, url, score, status, category, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error("Failed to load logs", { description: error.message });
    setLogs((data as LogRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();

    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      channel = supabase
        .channel(`scan_history:${auth.user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "scan_history", filter: `user_id=eq.${auth.user.id}` },
          (payload) => {
            const row = payload.new as LogRow;
            setLogs((prev) => (prev.some((l) => l.id === row.id) ? prev : [row, ...prev]));
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "scan_history" },
          (payload) => {
            const oldRow = payload.old as { id: string };
            setLogs((prev) => prev.filter((l) => l.id !== oldRow.id));
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const filtered = logs.filter((log) => {
    if (filter !== "all" && log.status !== filter) return false;
    if (search && !log.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportCsv = () => {
    const csv =
      "URL,Score,Status,Category,Timestamp\n" +
      filtered.map((l) => `"${l.url}",${l.score},${l.status},${l.category ?? ""},${l.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "securesurf-logs.csv";
    a.click();
  };

  const deleteRow = async (id: string) => {
    const { error } = await supabase.from("scan_history").delete().eq("id", id);
    if (error) return toast.error("Delete failed", { description: error.message });
    setLogs((p) => p.filter((l) => l.id !== id));
  };

  const resultColors = {
    safe: "bg-safe/10 text-safe",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  } as const;

  return (
    <div className="container py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Scan Logs</h1>
          <p className="text-muted-foreground text-sm">Your scan history</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!filtered.length}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 border border-border transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {authed === false ? (
        <div className="p-10 rounded-2xl bg-card border border-border text-center">
          <p className="text-muted-foreground mb-4">Sign in to see your scan history.</p>
          <Link to="/login" className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition">
            Sign In
          </Link>
        </div>
      ) : (
        <>
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

          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">URL</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Timestamp</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                        No scans yet. Run one from the <Link to="/scanner" className="text-primary underline">Scanner</Link>.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((log) => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs max-w-[300px] truncate">{log.url}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.score > 60 ? "bg-danger/10 text-danger" : log.score > 30 ? "bg-warning/10 text-warning" : "bg-safe/10 text-safe"}`}>
                            {log.score}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${resultColors[log.status]}`}>{log.status}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground capitalize">{log.category ?? "—"}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => deleteRow(log.id)} className="p-1.5 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
