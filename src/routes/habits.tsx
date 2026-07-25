import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "Habits · Ascend" },
      { name: "description", content: "Streaks and heatmaps" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Discipline" title="Habits" description="Streaks and heatmaps" />,
});
