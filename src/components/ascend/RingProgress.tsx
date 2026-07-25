import { motion } from "motion/react";

export function RingProgress({
  value, size = 180, stroke = 12, label, sub,
}: { value: number; size?: number; stroke?: number; label?: string; sub?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.2 255)" />
            <stop offset="60%" stopColor="oklch(0.66 0.24 305)" />
            <stop offset="100%" stopColor="oklch(0.82 0.14 200)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#ringGrad)" strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 10px oklch(0.72 0.2 255 / 0.7))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
          {label ?? "Progress"}
        </div>
        <div className="mt-1 text-4xl font-semibold tracking-tight text-white">
          {Math.round(value)}
          <span className="text-lg text-white/50">%</span>
        </div>
        {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
      </div>
    </div>
  );
}
