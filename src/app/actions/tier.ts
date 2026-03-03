"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ActionResult,
  TierList,
  TierListWithRankings,
} from "@/types/tier";

export async function saveTierList(data: {
  topicId: string;
  rankings: { itemId: string; tier: string; position: number }[];
}): Promise<ActionResult<TierList>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // 티어리스트 생성
  const { data: tierList, error: listError } = await supabase
    .from("tier_lists")
    .insert({
      topic_id: data.topicId,
      user_id: user.id,
    })
    .select()
    .single();

  if (listError) {
    return { data: null, error: listError.message };
  }

  // 랭킹 저장
  if (data.rankings.length > 0) {
    const rankings = data.rankings.map((r) => ({
      tier_list_id: tierList.id,
      item_id: r.itemId,
      tier: r.tier,
      position: r.position,
    }));

    const { error: rankError } = await supabase
      .from("tier_rankings")
      .insert(rankings);

    if (rankError) {
      return { data: null, error: rankError.message };
    }
  }

  return { data: tierList, error: null };
}

export async function getGlobalTierListFeed(
  sort: "latest" | "popular" = "latest",
  limit = 20
): Promise<ActionResult<(TierListWithRankings & { topic_title: string; topic_slug: string; subcategory_slug: string; category_slug: string })[]>> {
  const supabase = await createClient();

  const query = supabase
    .from("tier_lists")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data: tierLists, error: listError } = await query;

  if (listError) {
    return { data: null, error: listError.message };
  }

  if (tierLists.length === 0) {
    return { data: [], error: null };
  }

  const tierListIds = tierLists.map((tl) => tl.id);
  const userIds = [...new Set(tierLists.map((tl) => tl.user_id))];
  const topicIds = [...new Set(tierLists.map((tl) => tl.topic_id))];

  const [rankingsResult, profilesResult, likesResult, topicsResult] = await Promise.all([
    supabase
      .from("tier_rankings")
      .select("*, item:items(*)")
      .in("tier_list_id", tierListIds)
      .order("position"),
    supabase.from("profiles").select("*").in("id", userIds),
    supabase
      .from("likes")
      .select("tier_list_id")
      .in("tier_list_id", tierListIds),
    supabase
      .from("topics")
      .select("id, title, slug, subcategory_id")
      .in("id", topicIds),
  ]);

  if (rankingsResult.error) return { data: null, error: rankingsResult.error.message };
  if (profilesResult.error) return { data: null, error: profilesResult.error.message };
  if (likesResult.error) return { data: null, error: likesResult.error.message };
  if (topicsResult.error) return { data: null, error: topicsResult.error.message };

  // Fetch subcategories + categories for URL building
  const subcategoryIds = [...new Set(topicsResult.data.map((t) => t.subcategory_id))];
  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id, slug, category_id")
    .in("id", subcategoryIds);

  const categoryIds = [...new Set((subcategories ?? []).map((s) => s.category_id))];
  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug")
    .in("id", categoryIds);

  const catMap = new Map((cats ?? []).map((c) => [c.id, c]));
  const subMap = new Map((subcategories ?? []).map((s) => [s.id, s]));
  const topicMap = new Map(topicsResult.data.map((t) => [t.id, t]));

  const likeCounts: Record<string, number> = {};
  for (const like of likesResult.data) {
    likeCounts[like.tier_list_id] = (likeCounts[like.tier_list_id] || 0) + 1;
  }

  const profileMap = new Map(profilesResult.data.map((p) => [p.id, p]));

  const result = tierLists.map((tl) => {
    const topic = topicMap.get(tl.topic_id);
    const sub = topic ? subMap.get(topic.subcategory_id) : null;
    const cat = sub ? catMap.get(sub.category_id) : null;

    return {
      ...tl,
      rankings: rankingsResult.data.filter((r) => r.tier_list_id === tl.id),
      user: profileMap.get(tl.user_id)!,
      like_count: likeCounts[tl.id] || 0,
      topic_title: topic?.title ?? "",
      topic_slug: topic?.slug ?? "",
      subcategory_slug: sub?.slug ?? "",
      category_slug: cat?.slug ?? "",
    };
  });

  if (sort === "popular") {
    result.sort((a, b) => b.like_count - a.like_count);
  }

  return { data: result, error: null };
}

export async function getTierListFeed(
  topicId: string,
  sort: "latest" | "popular" = "latest"
): Promise<ActionResult<TierListWithRankings[]>> {
  const supabase = await createClient();

  // 티어리스트 조회
  const query = supabase
    .from("tier_lists")
    .select("*")
    .eq("topic_id", topicId);

  if (sort === "latest") {
    query.order("created_at", { ascending: false });
  }

  const { data: tierLists, error: listError } = await query;

  if (listError) {
    return { data: null, error: listError.message };
  }

  if (tierLists.length === 0) {
    return { data: [], error: null };
  }

  const tierListIds = tierLists.map((tl) => tl.id);
  const userIds = [...new Set(tierLists.map((tl) => tl.user_id))];

  // 랭킹 + 아이템 조회, 프로필 조회, 좋아요 수 조회를 병렬로
  const [rankingsResult, profilesResult, likesResult] = await Promise.all([
    supabase
      .from("tier_rankings")
      .select("*, item:items(*)")
      .in("tier_list_id", tierListIds)
      .order("position"),
    supabase.from("profiles").select("*").in("id", userIds),
    supabase
      .from("likes")
      .select("tier_list_id")
      .in("tier_list_id", tierListIds),
  ]);

  if (rankingsResult.error) {
    return { data: null, error: rankingsResult.error.message };
  }
  if (profilesResult.error) {
    return { data: null, error: profilesResult.error.message };
  }
  if (likesResult.error) {
    return { data: null, error: likesResult.error.message };
  }

  // 좋아요 수 집계
  const likeCounts: Record<string, number> = {};
  for (const like of likesResult.data) {
    likeCounts[like.tier_list_id] =
      (likeCounts[like.tier_list_id] || 0) + 1;
  }

  // 프로필 맵
  const profileMap = new Map(
    profilesResult.data.map((p) => [p.id, p])
  );

  // 조합
  const result: TierListWithRankings[] = tierLists.map((tl) => ({
    ...tl,
    rankings: rankingsResult.data.filter((r) => r.tier_list_id === tl.id),
    user: profileMap.get(tl.user_id)!,
    like_count: likeCounts[tl.id] || 0,
  }));

  // 인기순 정렬
  if (sort === "popular") {
    result.sort((a, b) => b.like_count - a.like_count);
  }

  return { data: result, error: null };
}
