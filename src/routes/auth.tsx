import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Rocket, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Particles } from "@/components/ascend/Particles";
import { GlassCard } from "@/components/ascend/GlassCard";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Ascend" },
      { name: "description", content: "Sign in to sync your journey across devices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signInGoogle, signInEmail, signUpEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/", replace: true });
  }, [user, loading, navigate]);

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);
    try {
      await signInGoogle();
    } catch (e) {
      toast.error(errorMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signin") await signInEmail(email, password);
      else await signUpEmail(email, password);
    } catch (err) {
      toast.error(errorMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-0">
        <Particles count={45} />
      </div>
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-[image:var(--gradient-cyber)] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-[image:var(--gradient-emerald)] opacity-20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-cyber)] shadow-[var(--shadow-glow)]">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">Mission Control</div>
            <div className="text-2xl font-semibold tracking-tight text-gradient">Ascend</div>
          </div>
        </div>

        <GlassCard glow="purple" className="p-7">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
            {mode === "signin" ? "Sign in" : "Create account"}
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {mode === "signin" ? "Welcome back" : "Start your ascent"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Your data syncs across devices. Any local progress migrates automatically on first sign-in.
          </p>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/45">
                <Mail className="h-3 w-3" /> Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ascend.dev"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/45">
                <Lock className="h-3 w-3" /> Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-cyber)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-90 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="mt-5 w-full text-center text-xs text-white/60 hover:text-white"
          >
            {mode === "signin" ? "Need an account? Sign up →" : "Have an account? Sign in →"}
          </button>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.3 12 2.3 6.8 2.3 2.6 6.5 2.6 11.7s4.2 9.4 9.4 9.4c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.7H12z" />
    </svg>
  );
}

function errorMsg(e: unknown) {
  if (!e) return "Something went wrong";
  const code = (e as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential": return "Invalid email or password";
    case "auth/user-not-found": return "No account with that email";
    case "auth/wrong-password": return "Wrong password";
    case "auth/email-already-in-use": return "That email already has an account";
    case "auth/weak-password": return "Password must be at least 6 characters";
    case "auth/popup-closed-by-user": return "Popup closed before finishing";
    case "auth/unauthorized-domain": return "This domain isn't authorized in Firebase → Auth → Settings";
    case "auth/api-key-not-valid": return "Firebase API key missing/invalid — set VITE_FIREBASE_API_KEY in .env";
    default: return (e as { message?: string })?.message || "Something went wrong";
  }
}
