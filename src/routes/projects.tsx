import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · Ascend" },
      { name: "description", content: "Portfolio of everything built" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Craft" title="Projects" description="Portfolio of everything built" />,
});
