import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ascend/ComingSoon";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume · Ascend" },
      { name: "description", content: "Skills, experience, ATS score" },
    ],
  }),
  component: () => <ComingSoon eyebrow="Profile" title="Resume" description="Skills, experience, ATS score" />,
});
