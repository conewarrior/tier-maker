"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/tier";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, error: "로그인이 필요합니다." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { supabase: null, error: "권한이 없습니다." };

  return { supabase, error: null };
}

// --- 통계 ---

export async function getAdminStats(): Promise<
  ActionResult<{
    categories: number;
    subcategories: number;
    topics: number;
    items: number;
    tierLists: number;
  }>
> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const [cats, subs, topics, items, tiers] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("subcategories").select("id", { count: "exact", head: true }),
    supabase.from("topics").select("id", { count: "exact", head: true }),
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase.from("tier_lists").select("id", { count: "exact", head: true }),
  ]);

  return {
    data: {
      categories: cats.count ?? 0,
      subcategories: subs.count ?? 0,
      topics: topics.count ?? 0,
      items: items.count ?? 0,
      tierLists: tiers.count ?? 0,
    },
    error: null,
  };
}

// --- 카테고리 ---

export async function getAdminCategories(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      sort_order: number;
      subcategory_count: number;
    }>
  >
> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (catErr) return { data: null, error: catErr.message };

  const { data: subs } = await supabase
    .from("subcategories")
    .select("category_id");

  const result = (categories ?? []).map((cat) => ({
    ...cat,
    subcategory_count: (subs ?? []).filter((s) => s.category_id === cat.id)
      .length,
  }));

  return { data: result, error: null };
}

export async function createCategory(data: {
  name: string;
  slug: string;
  icon?: string;
  sort_order?: number;
}): Promise<ActionResult<{ id: string }>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { data: cat, error: insertErr } = await supabase
    .from("categories")
    .insert({
      name: data.name,
      slug: data.slug,
      icon: data.icon ?? null,
      sort_order: data.sort_order ?? 0,
    })
    .select("id")
    .single();

  if (insertErr) return { data: null, error: insertErr.message };
  return { data: cat, error: null };
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; icon?: string; sort_order?: number }
): Promise<ActionResult<null>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { error: updateErr } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id);

  if (updateErr) return { data: null, error: updateErr.message };
  return { data: null, error: null };
}

export async function deleteCategory(id: string): Promise<ActionResult<null>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { error: delErr } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (delErr) return { data: null, error: delErr.message };
  return { data: null, error: null };
}

// --- 소분류 ---

export async function getAdminSubcategories(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      slug: string;
      category_id: string;
      category_name: string;
      item_count: number;
      topic_count: number;
      created_at: string;
    }>
  >
> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { data: subs, error: subErr } = await supabase
    .from("subcategories")
    .select("id, name, slug, category_id, created_at")
    .order("created_at", { ascending: false });

  if (subErr) return { data: null, error: subErr.message };

  const { data: cats } = await supabase.from("categories").select("id, name");
  const { data: items } = await supabase
    .from("items")
    .select("subcategory_id");
  const { data: topics } = await supabase
    .from("topics")
    .select("subcategory_id");

  const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));

  const result = (subs ?? []).map((sub) => ({
    id: sub.id,
    name: sub.name,
    slug: sub.slug,
    category_id: sub.category_id,
    category_name: catMap.get(sub.category_id) ?? "",
    item_count: (items ?? []).filter((i) => i.subcategory_id === sub.id).length,
    topic_count: (topics ?? []).filter((t) => t.subcategory_id === sub.id)
      .length,
    created_at: sub.created_at,
  }));

  return { data: result, error: null };
}

export async function createAdminSubcategory(data: {
  categoryId: string;
  name: string;
  slug: string;
}): Promise<ActionResult<{ id: string }>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { data: sub, error: insertErr } = await supabase
    .from("subcategories")
    .insert({
      category_id: data.categoryId,
      name: data.name,
      slug: data.slug,
      normalized_name: data.name.toLowerCase().replace(/\s/g, ""),
    })
    .select("id")
    .single();

  if (insertErr) return { data: null, error: insertErr.message };
  return { data: sub, error: null };
}

export async function moveSubcategory(
  subcategoryId: string,
  targetCategoryId: string
): Promise<ActionResult<null>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { error: updateErr } = await supabase
    .from("subcategories")
    .update({ category_id: targetCategoryId })
    .eq("id", subcategoryId);

  if (updateErr) return { data: null, error: updateErr.message };
  return { data: null, error: null };
}

export async function deleteSubcategory(
  id: string
): Promise<ActionResult<null>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { error: delErr } = await supabase
    .from("subcategories")
    .delete()
    .eq("id", id);

  if (delErr) return { data: null, error: delErr.message };
  return { data: null, error: null };
}

// --- 토픽 ---

export async function getAdminTopics(): Promise<
  ActionResult<
    Array<{
      id: string;
      title: string;
      slug: string;
      subcategory_name: string;
      tier_list_count: number;
      created_at: string;
    }>
  >
> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { data: topics, error: topicErr } = await supabase
    .from("topics")
    .select("id, title, slug, subcategory_id, created_at")
    .order("created_at", { ascending: false });

  if (topicErr) return { data: null, error: topicErr.message };

  const { data: subs } = await supabase
    .from("subcategories")
    .select("id, name");
  const { data: tiers } = await supabase
    .from("tier_lists")
    .select("topic_id");

  const subMap = new Map((subs ?? []).map((s) => [s.id, s.name]));

  const result = (topics ?? []).map((topic) => ({
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    subcategory_name: subMap.get(topic.subcategory_id) ?? "",
    tier_list_count: (tiers ?? []).filter((t) => t.topic_id === topic.id)
      .length,
    created_at: topic.created_at,
  }));

  return { data: result, error: null };
}

export async function deleteTopic(id: string): Promise<ActionResult<null>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { error: delErr } = await supabase
    .from("topics")
    .delete()
    .eq("id", id);

  if (delErr) return { data: null, error: delErr.message };
  return { data: null, error: null };
}

// --- 아이템 ---

export async function getAdminItems(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      image_url: string;
      subcategory_name: string;
      created_at: string;
    }>
  >
> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { data: items, error: itemErr } = await supabase
    .from("items")
    .select("id, name, image_url, subcategory_id, created_at")
    .order("created_at", { ascending: false });

  if (itemErr) return { data: null, error: itemErr.message };

  const { data: subs } = await supabase
    .from("subcategories")
    .select("id, name");
  const subMap = new Map((subs ?? []).map((s) => [s.id, s.name]));

  const result = (items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    image_url: item.image_url,
    subcategory_name: subMap.get(item.subcategory_id) ?? "",
    created_at: item.created_at,
  }));

  return { data: result, error: null };
}

export async function deleteItem(id: string): Promise<ActionResult<null>> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { data: null, error: error! };

  const { error: delErr } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (delErr) return { data: null, error: delErr.message };
  return { data: null, error: null };
}
