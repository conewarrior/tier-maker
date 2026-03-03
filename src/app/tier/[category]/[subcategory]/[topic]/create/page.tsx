import { createClient } from "@/lib/supabase/server";
import { TierEditorPage } from "./TierEditorPage";

interface TierCreatePageProps {
  params: Promise<{ category: string; subcategory: string; topic: string }>;
}

export default async function TierCreatePage({ params }: TierCreatePageProps) {
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

  // Fetch topic
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

  let items: Array<{ id: string; name: string; image_url: string }> = [];
  if (itemIds.length > 0) {
    const { data } = await supabase
      .from("items")
      .select("id, name, image_url")
      .in("id", itemIds);
    items = data ?? [];
  }

  const tierItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.image_url,
  }));

  return (
    <TierEditorPage
      topicId={topic.id}
      topicTitle={topic.title}
      items={tierItems}
      backHref={`/tier/${category}/${subcategory}/${topicSlug}`}
    />
  );
}
