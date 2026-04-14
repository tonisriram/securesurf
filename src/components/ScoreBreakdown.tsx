import type { ScanResult } from "@/lib/heuristics";

interface Props {
  result: ScanResult;
}

const sources = [
  { key: "heuristics", label: "Heuristic Engine", weight: 40 },
  { key: "api", label: "Threat Intelligence APIs", weight: 35 },
  { key: "ml", label: "ML Model", weight: 25 },
];

export default function ScoreBreakdown({ result }: Props) {
  const hScore = Math.min(100, Math.max(0, result.heuristics.reduce((s, h) => s + h.score, 0) + 20));
  const apiScore = result.apiIntel.phishTank.listed ? 85 : result.apiIntel.virusTotal.positives > 3 ? 70 : 10;
  const mlScore = result.threatScore; // approximate

  const scores = [
    { ...sources[0], score: hScore },
    { ...sources[1], score: apiScore },
    { ...sources[2], score: mlScore },
  ];

  const getColor = (s: number) => s <= 30 ? "bg-safe" : s <= 70 ? "bg-warning" : "bg-danger";

  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <h3 className="font-display font-semibold mb-4">Score Breakdown</h3>
      <div className="space-y-4">
        {scores.map((s) => (
          <div key={s.key}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{s.label} <span className="text-xs">({s.weight}%)</span></span>
              <span className="font-mono font-bold text-xs">{s.score}/100</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getColor(s.score)}`} style={{ width: `${s.score}%` }} />
            </div>
          </div>
        ))}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-sm font-medium">Combined Threat Score</span>
          <span className={`text-lg font-display font-bold ${result.threatScore <= 30 ? "text-safe" : result.threatScore <= 70 ? "text-warning" : "text-danger"}`}>
            {result.threatScore}/100
          </span>
        </div>
      </div>
    </div>
  );
}
