import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Ascend" },
      { name: "description", content: "Skill growth, time allocation, insights" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Insights" title="Analytics" description="Skill growth, time allocation, insights" />,
});
