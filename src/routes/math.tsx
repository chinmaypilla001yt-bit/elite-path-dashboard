import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/math")({
  head: () => ({
    meta: [
      { title: "Mathematics · Ascend" },
      { name: "description", content: "Topic mastery across all math domains" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Reasoning" title="Mathematics" description="Topic mastery across all math domains" />,
});
