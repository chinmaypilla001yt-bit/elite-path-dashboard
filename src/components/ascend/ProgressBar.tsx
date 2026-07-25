import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value, label, right, accent = "cyber",
}: {
  value: number;
  label?: string;
  right?: string;
  accent?: "cyber" | "emerald" | "gold";
}) {
  const map = {
    cyber: "bg-[image:var(--gradient-cyber)]",
    emerald: "bg-[image:var(--gradient-emerald)]",
    gold: "bg-[image:var(--gradient-gold)]",
  } as const;
  return (
    <div>
      {(label || right) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-white/70">{label}</span>
          <span className="font-mono text-white/60">{right ?? `${Math.round(value)}%`}</span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-[0_0_16px_oklch(0.72_0.2_255/0.6)]", map[accent])}
        />
      </div>
    </div>
  );
}
