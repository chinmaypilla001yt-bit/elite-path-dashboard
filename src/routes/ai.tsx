import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI & ML · Ascend" },
      { name: "description", content: "Courses, papers, models, deployments" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Intelligence" title="AI & ML" description="Courses, papers, models, deployments" />,
});
