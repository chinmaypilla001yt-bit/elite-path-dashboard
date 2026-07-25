import { motion } from "motion/react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow, title, description, actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow && (
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-white/60">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
