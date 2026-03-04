import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getItems } from "@/app/actions/item";
import { getTopicsBySubcategory } from "@/app/actions/topic";
import { ItemGrid } from "@/components/item/ItemGrid";
import { TopicCard } from "@/components/topic/TopicCard";
import { SubcategoryBanner } from "@/components/subcategory/SubcategoryBanner";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const categorySlug = decodeURIComponent(category);
  const subcategorySlug = decodeURIComponent(subcategory);
  const supabase = await createClient();

  // Fetch category first
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!cat) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          카테고리를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  // Fetch subcategory by slug + category_id
  const { data: sub } = await supabase
    .from("subcategories")
    .select("*")
    .eq("slug", subcategorySlug)
    .eq("category_id", cat.id)
    .single();

  if (!sub) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          소분류를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  const [itemsResult, topicsResult, { data: { user } }] = await Promise.all([
    getItems(sub.id),
    getTopicsBySubcategory(sub.id),
    supabase.auth.getUser(),
  ]);

  const items = itemsResult.data ?? [];
  const topics = topicsResult.data ?? [];
  const isLoggedIn = !!user;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Banner */}
      <SubcategoryBanner
        subcategoryId={sub.id}
        bannerImageUrl={sub.banner_image_url}
        isLoggedIn={isLoggedIn}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{sub.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            아이템 {items.length}개
          </p>
        </div>
      </div>

      {/* Item pool */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">아이템 풀</h2>
        <ItemGrid items={items} subcategoryId={sub.id} isLoggedIn={isLoggedIn} />
      </div>

      {/* Topics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">토픽</h2>
          <Link
            href="/tier/create"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            토픽 만들기
          </Link>
        </div>

        {topics.length === 0 ? (
          <div className="rounded-lg border border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              아직 토픽이 없습니다. 첫 번째 토픽을 만들어보세요!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                href={`/tier/${category}/${subcategory}/${topic.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
