import { getAdminStats } from "@/app/actions/admin";
import { AdminContent } from "./AdminContent";

export default async function AdminPage() {
  const statsResult = await getAdminStats();
  const stats = statsResult.data ?? {
    categories: 0,
    subcategories: 0,
    topics: 0,
    items: 0,
    tierLists: 0,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-xl font-bold text-foreground">Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "카테고리", value: stats.categories },
          { label: "소분류", value: stats.subcategories },
          { label: "토픽", value: stats.topics },
          { label: "아이템", value: stats.items },
          { label: "티어리스트", value: stats.tierLists },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border p-4 text-center"
          >
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <AdminContent />
    </div>
  );
}
