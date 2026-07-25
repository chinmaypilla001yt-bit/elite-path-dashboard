import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar · Ascend" },
      { name: "description", content: "Daily, weekly, monthly planning" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Planner" title="Calendar" description="Daily, weekly, monthly planning" />,
});
