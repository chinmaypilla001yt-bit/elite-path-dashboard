import type { ReactNode } from "react";
import { AscendSidebar } from "./Sidebar";
import { Particles } from "./Particles";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full">
      {/* ambient grid + particles */}
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-[0.35]" />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Particles count={45} />
      </div>

      <AscendSidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
