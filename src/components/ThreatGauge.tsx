import { motion } from "framer-motion";

interface ThreatGaugeProps {
  score: number; // 0-100
  size?: number;
}

export default function ThreatGauge({ score, size = 200 }: ThreatGaugeProps) {
  const getColor = () => {
    if (score <= 30) return "hsl(145, 70%, 45%)";
    if (score <= 70) return "hsl(35, 92%, 55%)";
    return "hsl(0, 72%, 55%)";
  };

  const getLabel = () => {
    if (score <= 30) return "Safe";
    if (score <= 70) return "Warning";
    return "Danger";
  };

  const getLabelClass = () => {
    if (score <= 30) return "text-safe";
    if (score <= 70) return "text-warning";
    return "text-danger";
  };

  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke="hsl(220, 14%, 18%)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <motion.path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          className="fill-foreground font-display font-bold"
          fontSize={size / 5}
        >
          {score}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          className="fill-muted-foreground font-mono"
          fontSize={size / 14}
        >
          / 100
        </text>
      </svg>
      <span className={`text-lg font-bold ${getLabelClass()}`}>{getLabel()}</span>
    </div>
  );
}
