"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Comment, Profile } from "@/types/tier";

export async function toggleLike(
  tierListId: string
): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("user_id")
    .eq("tier_list_id", tierListId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Remove like
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("tier_list_id", tierListId)
      .eq("user_id", user.id);

    if (error) {
      return { data: null, error: error.message };
    }
  } else {
    // Add like
    const { error } = await supabase
      .from("likes")
      .insert({ tier_list_id: tierListId, user_id: user.id });

    if (error) {
      return { data: null, error: error.message };
    }
  }

  // Get updated count
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("tier_list_id", tierListId);

  return {
    data: { liked: !existing, likeCount: count ?? 0 },
    error: null,
  };
}

export async function getLikeStatus(
  tierListId: string
): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [likeCheck, countResult] = await Promise.all([
    user
      ? supabase
          .from("likes")
          .select("user_id")
          .eq("tier_list_id", tierListId)
          .eq("user_id", user.id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("tier_list_id", tierListId),
  ]);

  return {
    data: {
      liked: !!likeCheck.data,
      likeCount: countResult.count ?? 0,
    },
    error: null,
  };
}

export type CommentWithUser = Comment & { user: Profile };

export async function getComments(
  tierListId: string
): Promise<ActionResult<CommentWithUser[]>> {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .eq("tier_list_id", tierListId)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  if (comments.length === 0) {
    return { data: [], error: null };
  }

  const userIds = [...new Set(comments.map((c) => c.user_id))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (profileError) {
    return { data: null, error: profileError.message };
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const result: CommentWithUser[] = comments.map((c) => ({
    ...c,
    user: profileMap.get(c.user_id)!,
  }));

  return { data: result, error: null };
}

export async function addComment(
  tierListId: string,
  content: string
): Promise<ActionResult<CommentWithUser>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { data: null, error: "댓글 내용을 입력해주세요." };
  }

  if (trimmed.length > 500) {
    return { data: null, error: "댓글은 500자까지 입력할 수 있습니다." };
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      tier_list_id: tierListId,
      user_id: user.id,
      content: trimmed,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    data: { ...comment, user: profile! },
    error: null,
  };
}

export async function deleteComment(
  commentId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // Only delete own comments
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}
