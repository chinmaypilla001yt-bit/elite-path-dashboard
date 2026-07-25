import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements · Ascend" },
      { name: "description", content: "Badges, ranks, boss battles" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Trophies" title="Achievements" description="Badges, ranks, boss battles" />,
});
