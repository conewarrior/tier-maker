"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ActionResult,
  Profile,
  TierListWithRankings,
  Topic,
} from "@/types/tier";

export async function getMyProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
}

export async function updateNickname(
  nickname: string
): Promise<ActionResult<Profile>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const trimmed = nickname.trim();
  if (!trimmed) {
    return { data: null, error: "닉네임을 입력해주세요." };
  }

  if (trimmed.length > 20) {
    return { data: null, error: "닉네임은 20자까지 입력할 수 있습니다." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ nickname: trimmed })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
}

export async function getMyTierLists(): Promise<
  ActionResult<TierListWithRankings[]>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const { data: tierLists, error: listError } = await supabase
    .from("tier_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (listError) {
    return { data: null, error: listError.message };
  }

  if (tierLists.length === 0) {
    return { data: [], error: null };
  }

  const tierListIds = tierLists.map((tl) => tl.id);

  // Fetch rankings + items and like counts in parallel
  const [rankingsResult, likesResult] = await Promise.all([
    supabase
      .from("tier_rankings")
      .select("*, item:items(*)")
      .in("tier_list_id", tierListIds)
      .order("position"),
    supabase
      .from("likes")
      .select("tier_list_id")
      .in("tier_list_id", tierListIds),
  ]);

  if (rankingsResult.error) {
    return { data: null, error: rankingsResult.error.message };
  }
  if (likesResult.error) {
    return { data: null, error: likesResult.error.message };
  }

  // Count likes per tier list
  const likeCounts: Record<string, number> = {};
  for (const like of likesResult.data) {
    likeCounts[like.tier_list_id] =
      (likeCounts[like.tier_list_id] || 0) + 1;
  }

  // Get own profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const result: TierListWithRankings[] = tierLists.map((tl) => ({
    ...tl,
    rankings: rankingsResult.data.filter((r) => r.tier_list_id === tl.id),
    user: profile!,
    like_count: likeCounts[tl.id] || 0,
  }));

  return { data: result, error: null };
}

/** Topic with category/subcategory info for building links */
export interface TopicWithPath extends Topic {
  subcategory: { slug: string; category: { slug: string } };
}

export async function getMyTopics(): Promise<ActionResult<TopicWithPath[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const { data: topics, error } = await supabase
    .from("topics")
    .select("*, subcategory:subcategories(slug, category:categories(slug))")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: topics as TopicWithPath[], error: null };
}

/** Tier list with topic path info for building links */
export interface LikedTierListWithPath extends TierListWithRankings {
  topic: {
    slug: string;
    subcategory: { slug: string; category: { slug: string } };
  };
}

export async function getMyLikedTierLists(): Promise<
  ActionResult<LikedTierListWithPath[]>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // Get liked tier list ids
  const { data: likes, error: likesError } = await supabase
    .from("likes")
    .select("tier_list_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (likesError) {
    return { data: null, error: likesError.message };
  }

  if (likes.length === 0) {
    return { data: [], error: null };
  }

  const tierListIds = likes.map((l) => l.tier_list_id);

  // Fetch tier lists with topic path
  const { data: tierLists, error: listError } = await supabase
    .from("tier_lists")
    .select(
      "*, topic:topics(slug, subcategory:subcategories(slug, category:categories(slug)))"
    )
    .in("id", tierListIds);

  if (listError) {
    return { data: null, error: listError.message };
  }

  const userIds = [...new Set(tierLists.map((tl) => tl.user_id))];

  // Fetch rankings, profiles, like counts in parallel
  const [rankingsResult, profilesResult, likeCountsResult] = await Promise.all([
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
  if (likeCountsResult.error) {
    return { data: null, error: likeCountsResult.error.message };
  }

  const likeCounts: Record<string, number> = {};
  for (const like of likeCountsResult.data) {
    likeCounts[like.tier_list_id] =
      (likeCounts[like.tier_list_id] || 0) + 1;
  }

  const profileMap = new Map(
    profilesResult.data.map((p) => [p.id, p])
  );

  const result: LikedTierListWithPath[] = tierLists.map((tl) => ({
    ...tl,
    rankings: rankingsResult.data.filter((r) => r.tier_list_id === tl.id),
    user: profileMap.get(tl.user_id)!,
    like_count: likeCounts[tl.id] || 0,
    topic: tl.topic,
  }));

  return { data: result, error: null };
}
