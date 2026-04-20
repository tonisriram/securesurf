import { useState, useMemo } from "react";
import { Upload, Download, ArrowUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  url: string;
  score?: number;
  status?: "safe" | "warning" | "danger";
  category?: string;
  explanation?: string;
  state: "pending" | "scanning" | "done" | "error";
  error?: string;
};

type SortKey = "url" | "score" | "status";

const CONCURRENCY = 5;

function parseCsv(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(",")[0].trim().replace(/^"|"$/g, ""))
    .filter((u) => u && u.toLowerCase() !== "url");
}

async function scanOne(url: string) {
  const { data, error } = await supabase.functions.invoke("scan-url", { body: { url } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function BulkScan() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const urls = parseCsv(String(reader.result || ""));
      if (!urls.length) {
        toast.error("No URLs found in CSV");
        return;
      }
      setRows(urls.map((url) => ({ url, state: "pending" })));
      toast.success(`Loaded ${urls.length} URLs`);
    };
    reader.readAsText(file);
  };

  const runAll = async () => {
    if (!rows.length || running) return;
    setRunning(true);
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id ?? null;

    const queue = rows.map((_, i) => i);
    const work = async () => {
      while (queue.length) {
        const i = queue.shift()!;
        setRows((p) => p.map((r, idx) => (idx === i ? { ...r, state: "scanning" } : r)));
        try {
          const res = await scanOne(rows[i].url);
          setRows((p) =>
            p.map((r, idx) =>
              idx === i
                ? {
                    ...r,
                    state: "done",
                    score: res.score,
                    status: res.status,
                    category: res.category,
                    explanation: res.explanation,
                  }
                : r,
            ),
          );
          await supabase.from("scan_history").insert({
            user_id: userId,
            url: rows[i].url,
            score: res.score,
            status: res.status,
            category: res.category,
            explanation: res.explanation,
            signals: res.signals ?? [],
            ai_used: res.ai_used ?? false,
          });
        } catch (e: any) {
          setRows((p) => p.map((r, idx) => (idx === i ? { ...r, state: "error", error: e?.message ?? "failed" } : r)));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, rows.length) }, work));
    setRunning(false);
    toast.success("Bulk scan complete");
  };

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "score" ? "desc" : "asc");
    }
  };

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const exportCsv = () => {
    const csv =
      "URL,Score,Status,Category,Explanation\n" +
      sorted
        .map(
          (r) =>
            `"${r.url}",${r.score ?? ""},${r.status ?? ""},${r.category ?? ""},"${(r.explanation ?? "").replace(/"/g, "'")}"`,
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bulk-scan-results.csv";
    a.click();
  };

  const loadSample = () => {
    setRows(
      [
        "https://google.com",
        "https://github.com",
        "http://192.168.1.1/login/verify-account",
        "http://paypal-secure-login.suspicious-site.com/verify",
        "http://free-prize.xyz/claim",
      ].map((url) => ({ url, state: "pending" })),
    );
  };

  const statusColor = (s?: string) =>
    s === "safe" ? "bg-safe/10 text-safe" : s === "warning" ? "bg-warning/10 text-warning" : s === "danger" ? "bg-danger/10 text-danger" : "bg-secondary text-muted-foreground";

  const doneCount = rows.filter((r) => r.state === "done").length;

  return (
    <div className="container py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Bulk URL Scanner</h1>
        <p className="text-muted-foreground text-sm">Upload a CSV of URLs and scan them in parallel</p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 cursor-pointer transition">
            <Upload className="w-4 h-4" /> Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
          <button
            onClick={loadSample}
            className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 border border-border transition"
          >
            Load sample
          </button>
          <button
            onClick={runAll}
            disabled={!rows.length || running}
            className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition inline-flex items-center gap-2"
          >
            {running && <Loader2 className="w-4 h-4 animate-spin" />}
            {running ? `Scanning ${doneCount}/${rows.length}` : `Scan ${rows.length || ""} URLs`}
          </button>
          {doneCount > 0 && (
            <button
              onClick={exportCsv}
              className="ml-auto px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 border border-border transition inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export results
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          CSV format: one URL per line (or first column). Scans run {CONCURRENCY} at a time.
        </p>
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium cursor-pointer" onClick={() => toggleSort("url")}>
                    <span className="inline-flex items-center gap-1">URL <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-5 py-3 font-medium cursor-pointer" onClick={() => toggleSort("score")}>
                    <span className="inline-flex items-center gap-1">Score <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-5 py-3 font-medium cursor-pointer" onClick={() => toggleSort("status")}>
                    <span className="inline-flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-5 py-3 font-mono text-xs max-w-[280px] truncate">{r.url}</td>
                    <td className="px-5 py-3">
                      {r.state === "scanning" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : r.score !== undefined ? (
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${r.score > 60 ? "bg-danger/10 text-danger" : r.score > 30 ? "bg-warning/10 text-warning" : "bg-safe/10 text-safe"}`}>
                          {r.score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor(r.status)}`}>
                        {r.state === "error" ? "error" : r.status ?? r.state}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground capitalize">{r.category ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-[320px] truncate" title={r.explanation}>
                      {r.error ?? r.explanation ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
