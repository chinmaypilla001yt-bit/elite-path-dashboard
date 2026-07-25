import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon, label, value, hint, accent = "blue", delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: "blue" | "purple" | "cyan" | "emerald" | "gold";
  delay?: number;
}) {
  const map: Record<string, string> = {
    blue: "from-[oklch(0.72_0.2_255)] to-[oklch(0.66_0.24_305)]",
    purple: "from-[oklch(0.66_0.24_305)] to-[oklch(0.72_0.2_255)]",
    cyan: "from-[oklch(0.82_0.14_200)] to-[oklch(0.72_0.2_255)]",
    emerald: "from-[oklch(0.75_0.18_155)] to-[oklch(0.82_0.14_200)]",
    gold: "from-[oklch(0.83_0.16_85)] to-[oklch(0.7_0.19_45)]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="glass relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-white/50">{hint}</div>}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-[0_0_24px_-6px_oklch(0.72_0.2_255/0.6)]",
            map[accent],
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-[image:var(--gradient-cyber)] opacity-10 blur-2xl" />
    </motion.div>
  );
}
