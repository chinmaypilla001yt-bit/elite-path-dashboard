import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Ascend" },
      { name: "description", content: "Preferences, integrations, account" },
    ],
  }),
  component: () => <ComingSoon eyebrow="System" title="Settings" description="Preferences, integrations, account" />,
});
