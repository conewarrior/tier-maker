import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTierListFeed } from "@/app/actions/tier";
import { ItemGrid } from "@/components/item/ItemGrid";
import { TierListFeed } from "./TierListFeed";

interface TopicPageProps {
  params: Promise<{ category: string; subcategory: string; topic: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { category, subcategory, topic: topicSlug } = await params;
  const categorySlug = decodeURIComponent(category);
  const subcategorySlug = decodeURIComponent(subcategory);
  const decodedTopicSlug = decodeURIComponent(topicSlug);
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
        <p className="text-sm text-muted-foreground">페이지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Fetch subcategory
  const { data: sub } = await supabase
    .from("subcategories")
    .select("id")
    .eq("slug", subcategorySlug)
    .eq("category_id", cat.id)
    .single();

  if (!sub) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">페이지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { data: topic } = await supabase
    .from("topics")
    .select("*")
    .eq("subcategory_id", sub.id)
    .eq("slug", decodedTopicSlug)
    .single();

  if (!topic) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">토픽을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Fetch topic items
  const { data: topicItems } = await supabase
    .from("topic_items")
    .select("item_id")
    .eq("topic_id", topic.id);

  const itemIds = topicItems?.map((ti) => ti.item_id) ?? [];

  let items: Array<{ id: string; subcategory_id: string; name: string; image_url: string; created_by: string | null; created_at: string }> = [];
  if (itemIds.length > 0) {
    const { data } = await supabase
      .from("items")
      .select("*")
      .in("id", itemIds);
    items = data ?? [];
  }

  // Fetch user & tier list feed
  const [{ data: { user } }, feedResult] = await Promise.all([
    supabase.auth.getUser(),
    getTierListFeed(topic.id, "latest"),
  ]);
  const tierLists = feedResult.data ?? [];
  const isLoggedIn = !!user;

  const basePath = `/tier/${category}/${subcategory}/${topicSlug}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
          {topic.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {topic.description}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            아이템 {items.length}개
          </p>
        </div>
        <Link
          href={`${basePath}/create`}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          내 티어 만들기
        </Link>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">아이템</h2>
          <ItemGrid items={items} subcategoryId={sub.id} isLoggedIn={isLoggedIn} />
        </div>
      )}

      {/* Tier list feed */}
      <TierListFeed
        tierLists={tierLists}
        topicId={topic.id}
        basePath={basePath}
      />
    </div>
  );
}
