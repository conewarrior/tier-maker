"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils/slug";
import type { ActionResult, Topic, TopicWithItems } from "@/types/tier";

export async function createTopic(data: {
  subcategoryId: string;
  title: string;
  description?: string;
  itemIds: string[];
}): Promise<ActionResult<Topic>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const slug = generateSlug(data.title);

  // 토픽 생성
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .insert({
      subcategory_id: data.subcategoryId,
      title: data.title,
      slug,
      description: data.description ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (topicError) {
    return { data: null, error: topicError.message };
  }

  // topic_items 연결
  if (data.itemIds.length > 0) {
    const topicItems = data.itemIds.map((itemId) => ({
      topic_id: topic.id,
      item_id: itemId,
    }));

    const { error: linkError } = await supabase
      .from("topic_items")
      .insert(topicItems);

    if (linkError) {
      return { data: null, error: linkError.message };
    }
  }

  return { data: topic, error: null };
}

export async function getTopicsBySubcategory(
  subcategoryId: string
): Promise<ActionResult<Topic[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("subcategory_id", subcategoryId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getTopicDetail(
  topicId: string
): Promise<ActionResult<TopicWithItems>> {
  const supabase = await createClient();

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("*")
    .eq("id", topicId)
    .single();

  if (topicError) {
    return { data: null, error: topicError.message };
  }

  // topic_items를 통해 아이템 조회
  const { data: topicItems, error: linkError } = await supabase
    .from("topic_items")
    .select("item_id")
    .eq("topic_id", topicId);

  if (linkError) {
    return { data: null, error: linkError.message };
  }

  const itemIds = topicItems.map((ti) => ti.item_id);

  let items: TopicWithItems["items"] = [];
  if (itemIds.length > 0) {
    const { data: itemData, error: itemError } = await supabase
      .from("items")
      .select("*")
      .in("id", itemIds);

    if (itemError) {
      return { data: null, error: itemError.message };
    }

    items = itemData;
  }

  return {
    data: { ...topic, items },
    error: null,
  };
}
