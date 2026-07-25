import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = HTMLMotionProps<"div"> & {
  glow?: "blue" | "purple" | "cyan" | "emerald" | "gold" | "none";
  children?: ReactNode;
};

const glowMap: Record<string, string> = {
  blue: "before:bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.72_0.2_255/0.35),transparent_60%)]",
  purple: "before:bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.66_0.24_305/0.35),transparent_60%)]",
  cyan: "before:bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.82_0.14_200/0.35),transparent_60%)]",
  emerald: "before:bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.75_0.18_155/0.35),transparent_60%)]",
  gold: "before:bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.83_0.16_85/0.35),transparent_60%)]",
  none: "",
};

export function GlassCard({ className, glow = "none", children, ...rest }: Props) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "glass relative overflow-hidden p-5",
        "before:pointer-events-none before:absolute before:inset-x-0 before:-top-20 before:h-40 before:content-['']",
        glowMap[glow],
        className,
      )}
      {...rest}
    >
      <div className="relative">{children}</div>
    </motion.div>
  );
}
