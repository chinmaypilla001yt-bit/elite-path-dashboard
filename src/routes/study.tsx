import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Tracker · Ascend" },
      { name: "description", content: "Deep work sessions and time logs" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Focus" title="Study Tracker" description="Deep work sessions and time logs" />,
});
