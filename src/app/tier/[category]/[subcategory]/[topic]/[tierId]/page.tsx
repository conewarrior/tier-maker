import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TIER_ROWS } from "@/lib/constants";
import { getLikeStatus, getComments } from "@/app/actions/social";
import LikeButton from "@/components/social/LikeButton";
import ShareButton from "@/components/social/ShareButton";
import CommentSection from "@/components/social/CommentSection";
import { ReadOnlyTierBoard } from "@/components/tier/ReadOnlyTierBoard";

interface TierListDetailPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    topic: string;
    tierId: string;
  }>;
}

export default async function TierListDetailPage({
  params,
}: TierListDetailPageProps) {
  const { category, subcategory, topic: topicSlug, tierId } = await params;
  const supabase = await createClient();

  // Fetch tier list
  const { data: tierList } = await supabase
    .from("tier_lists")
    .select("*")
    .eq("id", tierId)
    .single();

  if (!tierList) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          티어리스트를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  // Fetch rankings with items, user profile, like status, and comments in parallel
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [rankingsResult, profileResult, likeStatusResult, commentsResult] =
    await Promise.all([
      supabase
        .from("tier_rankings")
        .select("*, item:items(*)")
        .eq("tier_list_id", tierId)
        .order("position"),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", tierList.user_id)
        .single(),
      getLikeStatus(tierId),
      getComments(tierId),
    ]);

  const rankings = rankingsResult.data ?? [];
  const profile = profileResult.data;
  const likeStatus = likeStatusResult.data ?? { liked: false, likeCount: 0 };
  const comments = commentsResult.data ?? [];

  // Group rankings by tier
  const tierGroups: Record<
    string,
    Array<{
      id: string;
      tier: string;
      position: number;
      item: { id: string; name: string; image_url: string } | null;
    }>
  > = {};
  for (const r of rankings) {
    if (!tierGroups[r.tier]) {
      tierGroups[r.tier] = [];
    }
    tierGroups[r.tier].push(r);
  }

  const backHref = `/tier/${category}/${subcategory}/${topicSlug}`;

  // Determine which tier rows to display (from DEFAULT + any custom ones)
  const defaultTierNames = DEFAULT_TIER_ROWS.map((r) => r.name);
  const allTierNames = [...new Set([...defaultTierNames, ...Object.keys(tierGroups)])];
  const orderedTiers = allTierNames.filter(
    (name) => defaultTierNames.includes(name) || tierGroups[name]
  );

  const getTierColor = (tier: string) => {
    const row = DEFAULT_TIER_ROWS.find((r) => r.name === tier);
    return row?.color ?? "#c0c0c0";
  };

  // Prepare rows data for ReadOnlyTierBoard
  const boardRows = orderedTiers.map((tierName) => ({
    name: tierName,
    color: getTierColor(tierName),
    items: (tierGroups[tierName] ?? []).map((ranking) => ({
      id: ranking.id,
      name: ranking.item?.name ?? null,
      image_url: ranking.item?.image_url ?? null,
    })),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex items-center justify-center rounded-md border border-border p-1.5 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {profile?.nickname ?? "익명"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(tierList.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
      </div>

      {/* Read-only tier board with export */}
      <ReadOnlyTierBoard rows={boardRows} topicTitle={decodeURIComponent(topicSlug)} />

      {/* Social actions */}
      <div className="flex items-center gap-2">
        <LikeButton
          tierListId={tierId}
          initialLiked={likeStatus.liked}
          initialCount={likeStatus.likeCount}
          isLoggedIn={!!user}
        />
        <ShareButton />
      </div>

      {/* Comments */}
      <CommentSection
        tierListId={tierId}
        initialComments={comments}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
