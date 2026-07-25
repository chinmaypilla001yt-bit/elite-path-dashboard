import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal · Ascend" },
      { name: "description", content: "Daily reflection, mood, energy" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Reflection" title="Journal" description="Daily reflection, mood, energy" />,
});
