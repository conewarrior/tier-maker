"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { User, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TierListPreview } from "@/components/tier/TierListPreview";
import { TopicCard } from "@/components/topic/TopicCard";
import {
  getMyTierLists,
  getMyTopics,
  getMyLikedTierLists,
  updateNickname,
} from "@/app/actions/mypage";
import type { Profile, TierListWithRankings } from "@/types/tier";
import type {
  TopicWithPath,
  LikedTierListWithPath,
} from "@/app/actions/mypage";

interface MyPageContentProps {
  profile: Profile;
}

const TABS = [
  { key: "tier-lists", label: "내 티어리스트" },
  { key: "topics", label: "내 토픽" },
  { key: "likes", label: "좋아요" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function MyPageContent({ profile }: MyPageContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("tier-lists");
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(
    profile.nickname ?? ""
  );
  const [isPending, startTransition] = useTransition();

  // Tab data states
  const [tierLists, setTierLists] = useState<TierListWithRankings[] | null>(
    null
  );
  const [topics, setTopics] = useState<TopicWithPath[] | null>(null);
  const [likedTierLists, setLikedTierLists] = useState<
    LikedTierListWithPath[] | null
  >(null);
  const [loadedTabs, setLoadedTabs] = useState<Set<TabKey>>(new Set());

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    if (!loadedTabs.has(tab)) {
      loadTabData(tab);
    }
  }

  function loadTabData(tab: TabKey) {
    startTransition(async () => {
      if (tab === "tier-lists") {
        const result = await getMyTierLists();
        if (result.data) setTierLists(result.data);
      } else if (tab === "topics") {
        const result = await getMyTopics();
        if (result.data) setTopics(result.data);
      } else if (tab === "likes") {
        const result = await getMyLikedTierLists();
        if (result.data) setLikedTierLists(result.data);
      }
      setLoadedTabs((prev) => new Set(prev).add(tab));
    });
  }

  function handleNicknameSave() {
    startTransition(async () => {
      const result = await updateNickname(nicknameInput);
      if (result.data) {
        setCurrentProfile(result.data);
        setIsEditingNickname(false);
      }
    });
  }

  // Load initial tab
  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadTabData("tier-lists");
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile section */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {currentProfile.avatar_url ? (
            <img
              src={currentProfile.avatar_url}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div>
          {isEditingNickname ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-ring"
                maxLength={20}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNicknameSave();
                  if (e.key === "Escape") {
                    setIsEditingNickname(false);
                    setNicknameInput(currentProfile.nickname ?? "");
                  }
                }}
              />
              <button
                onClick={handleNicknameSave}
                disabled={isPending}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditingNickname(false);
                  setNicknameInput(currentProfile.nickname ?? "");
                }}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">
                {currentProfile.nickname ?? "닉네임 없음"}
              </h1>
              <button
                onClick={() => setIsEditingNickname(true)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            가입일{" "}
            {new Date(currentProfile.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "border-b-2 pb-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {isPending && !loadedTabs.has(activeTab) ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          </div>
        ) : (
          <>
            {activeTab === "tier-lists" && (
              <TierListsTab tierLists={tierLists} />
            )}
            {activeTab === "topics" && <TopicsTab topics={topics} />}
            {activeTab === "likes" && (
              <LikedTab likedTierLists={likedTierLists} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TierListsTab({
  tierLists,
}: {
  tierLists: TierListWithRankings[] | null;
}) {
  if (!tierLists || tierLists.length === 0) {
    return (
      <div className="rounded-lg border border-border px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          아직 만든 티어리스트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tierLists.map((tl) => (
        <TierListPreview
          key={tl.id}
          tierList={tl}
          href={`/tier/list/${tl.id}`}
        />
      ))}
    </div>
  );
}

function TopicsTab({ topics }: { topics: TopicWithPath[] | null }) {
  if (!topics || topics.length === 0) {
    return (
      <div className="rounded-lg border border-border px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          아직 만든 토픽이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          href={`/tier/${topic.subcategory.category.slug}/${topic.subcategory.slug}/${topic.slug}`}
        />
      ))}
    </div>
  );
}

function LikedTab({
  likedTierLists,
}: {
  likedTierLists: LikedTierListWithPath[] | null;
}) {
  if (!likedTierLists || likedTierLists.length === 0) {
    return (
      <div className="rounded-lg border border-border px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          아직 좋아요한 티어리스트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {likedTierLists.map((tl) => {
        const href = `/tier/${tl.topic.subcategory.category.slug}/${tl.topic.subcategory.slug}/${tl.topic.slug}/${tl.id}`;
        return <TierListPreview key={tl.id} tierList={tl} href={href} />;
      })}
    </div>
  );
}
