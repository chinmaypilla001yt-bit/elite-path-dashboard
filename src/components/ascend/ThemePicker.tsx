import { useState } from "react";
import { Check, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useTheme, type ThemeId } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();
  const [pending, setPending] = useState<ThemeId | null>(null);

  async function pick(id: ThemeId) {
    if (id === theme) return;
    setPending(id);
    try {
      await setTheme(id);
      toast.success(`${themes.find((t) => t.id === id)?.name} theme applied`);
    } catch {
      toast.error("Theme saved locally, but syncing failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <GlassCard glow="purple" className="p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/45">Appearance</div>
      <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Palette className="h-4 w-4 text-primary" /> Theme
      </div>
      <p className="mt-2 text-sm text-foreground/60">
        Pick a look for the whole app. Your choice is saved to your profile and follows you across devices.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((t) => {
          const active = t.id === theme;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t.id)}
              aria-pressed={active}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-3 text-left transition",
                active
                  ? "border-primary/60 shadow-[var(--shadow-glow)]"
                  : "border-foreground/10 hover:border-foreground/25",
              )}
              style={{ background: t.background }}
            >
              {/* background + accent preview */}
              <div
                className="relative h-16 w-full overflow-hidden rounded-lg"
                style={{ background: t.surface }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }}
                />
                <div className="absolute left-2 top-4 space-y-1.5">
                  <div className="h-1.5 w-16 rounded-full" style={{ background: t.text, opacity: 0.85 }} />
                  <div className="h-1.5 w-10 rounded-full" style={{ background: t.text, opacity: 0.4 }} />
                  <div className="h-1.5 w-12 rounded-full" style={{ background: t.accent }} />
                </div>
                <div
                  className="absolute bottom-2 right-2 h-6 w-6 rounded-md"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold" style={{ color: t.text }}>
                    {t.name}
                  </div>
                  <div className="truncate text-[11px]" style={{ color: t.text, opacity: 0.55 }}>
                    {t.tagline}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {[t.background, t.surface, t.accent, t.accent2].map((c, i) => (
                    <span
                      key={i}
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-foreground/20"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {pending === t.id ? (
                <span
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: t.accent }}
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: t.background }} />
                </span>
              ) : active ? (
                <span
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: t.accent }}
                >
                  <Check className="h-3.5 w-3.5" style={{ color: t.background }} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
        Current · {themes.find((t) => t.id === theme)?.name}
      </div>
    </GlassCard>
  );
}
