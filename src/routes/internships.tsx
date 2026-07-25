import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/internships")({
  head: () => ({
    meta: [
      { title: "Internships · Ascend" },
      { name: "description", content: "Kanban of dream companies" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Applications" title="Internships" description="Kanban of dream companies" />,
});
