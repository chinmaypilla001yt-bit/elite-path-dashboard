import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ascend/AppShell";
import { PageHeader } from "@/components/ascend/PageHeader";
import { CategoryManager } from "@/components/ascend/CategoryManager";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories · Ascend" },
      { name: "description", content: "Create the categories every Ascend module uses — icons, colors, and order." },
      { property: "og:title", content: "Categories · Ascend" },
      { property: "og:description", content: "Your own subjects and domains, reused across every module." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <PageHeader
        eyebrow="Foundations"
        title="Categories"
        description="Define your own domains once — every module picks them up automatically."
      />
      <CategoryManager />
    </AppShell>
  ),
});
