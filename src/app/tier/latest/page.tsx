import { getGlobalTierListFeed } from "@/app/actions/tier";
import { TierListPreview } from "@/components/tier/TierListPreview";

export default async function LatestPage() {
  const result = await getGlobalTierListFeed("latest");
  const tierLists = result.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">최신 티어리스트</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          최근에 만들어진 티어리스트를 확인하세요.
        </p>
      </div>

      {tierLists.length === 0 ? (
        <div className="rounded-lg border border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            아직 만들어진 티어리스트가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tierLists.map((tierList) => (
            <TierListPreview
              key={tierList.id}
              tierList={tierList}
              href={`/tier/${tierList.category_slug}/${tierList.subcategory_slug}/${tierList.topic_slug}/${tierList.id}`}
              topicTitle={tierList.topic_title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
