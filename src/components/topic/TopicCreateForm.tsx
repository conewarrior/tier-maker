"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import { getCategories } from "@/app/actions/category";
import { getItems } from "@/app/actions/item";
import { getTopicsBySubcategory } from "@/app/actions/topic";
import { createSubcategory } from "@/app/actions/subcategory";
import { createTopic } from "@/app/actions/topic";
import type { CategoryWithSubcategories, Item, Topic } from "@/types/tier";
import { ItemSelector } from "./ItemSelector";

export function TopicCreateForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [isNewSubcategory, setIsNewSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  // Topic state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [isNewTopic, setIsNewTopic] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Items state (for new topic)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getCategories();
      if (result.data) {
        setCategories(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Load topics & items when subcategory changes
  useEffect(() => {
    if (!selectedSubcategoryId || isNewSubcategory) {
      setTopics([]);
      setItems([]);
      setSelectedTopicId("");
      setSelectedItemIds([]);
      setIsNewTopic(false);
      return;
    }
    async function loadData() {
      setLoadingTopics(true);
      setLoadingItems(true);
      const [topicsResult, itemsResult] = await Promise.all([
        getTopicsBySubcategory(selectedSubcategoryId),
        getItems(selectedSubcategoryId),
      ]);
      if (topicsResult.data) {
        setTopics(topicsResult.data);
        // If no topics exist, auto-switch to new topic mode
        if (topicsResult.data.length === 0) {
          setIsNewTopic(true);
        }
      }
      if (itemsResult.data) {
        setItems(itemsResult.data);
      }
      setLoadingTopics(false);
      setLoadingItems(false);
    }
    loadData();
  }, [selectedSubcategoryId, isNewSubcategory]);

  // When new subcategory mode, auto-enable new topic
  useEffect(() => {
    if (isNewSubcategory) {
      setIsNewTopic(true);
    }
  }, [isNewSubcategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let subcategoryId = selectedSubcategoryId;
      let subcategorySlug = "";

      // Get category slug
      const category = categories.find((c) => c.id === selectedCategoryId);
      if (!category) {
        setError("대분류를 선택해주세요.");
        setSubmitting(false);
        return;
      }

      // Create new subcategory if needed
      if (isNewSubcategory && newSubcategoryName.trim()) {
        const subResult = await createSubcategory({
          categoryId: selectedCategoryId,
          name: newSubcategoryName.trim(),
        });
        if (subResult.error) {
          setError(subResult.error);
          setSubmitting(false);
          return;
        }
        subcategoryId = subResult.data!.id;
        subcategorySlug = subResult.data!.slug;
      } else {
        const sub = category.subcategories.find(
          (s) => s.id === subcategoryId
        );
        subcategorySlug = sub?.slug ?? "";
      }

      if (!subcategoryId) {
        setError("소분류를 선택하거나 새로 만들어주세요.");
        setSubmitting(false);
        return;
      }

      // Use existing topic or create new one
      let topicSlug = "";

      if (!isNewTopic && selectedTopicId) {
        // Existing topic selected
        const existingTopic = topics.find((t) => t.id === selectedTopicId);
        topicSlug = existingTopic?.slug ?? "";
      } else {
        // Create new topic
        if (!title.trim()) {
          setError("토픽 제목을 입력해주세요.");
          setSubmitting(false);
          return;
        }

        const result = await createTopic({
          subcategoryId,
          title: title.trim(),
          description: description.trim() || undefined,
          itemIds: selectedItemIds,
        });

        if (result.error) {
          setError(result.error);
          setSubmitting(false);
          return;
        }
        topicSlug = result.data!.slug;
      }

      // Go directly to tier editor
      router.push(
        `/tier/${category.slug}/${subcategorySlug}/${topicSlug}/create`
      );
    } catch {
      setError("생성에 실패했습니다.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-foreground">티어리스트 만들기</h1>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 대분류 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">대분류</label>
        <div className="relative">
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setSelectedSubcategoryId("");
              setIsNewSubcategory(false);
              setSelectedTopicId("");
              setIsNewTopic(false);
            }}
            className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          >
            <option value="">대분류를 선택하세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* 소분류 선택 */}
      {selectedCategoryId && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">소분류</label>
          {!isNewSubcategory ? (
            <div className="space-y-2">
              <div className="relative">
                <select
                  value={selectedSubcategoryId}
                  onChange={(e) => {
                    setSelectedSubcategoryId(e.target.value);
                    setSelectedTopicId("");
                    setIsNewTopic(false);
                  }}
                  className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">소분류를 선택하세요</option>
                  {selectedCategory?.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <button
                type="button"
                onClick={() => setIsNewSubcategory(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                새 소분류 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="소분류 이름 입력"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required={isNewSubcategory}
              />
              <button
                type="button"
                onClick={() => {
                  setIsNewSubcategory(false);
                  setNewSubcategoryName("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                기존 소분류에서 선택
              </button>
            </div>
          )}
        </div>
      )}

      {/* 토픽 선택 */}
      {(selectedSubcategoryId || isNewSubcategory) && !loadingTopics && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">토픽</label>

          {/* 기존 토픽 목록 (새 소분류가 아닐 때만) */}
          {!isNewSubcategory && topics.length > 0 && !isNewTopic && (
            <div className="space-y-2">
              <div className="relative">
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">토픽을 선택하세요</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <button
                type="button"
                onClick={() => setIsNewTopic(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                새 토픽 만들기
              </button>
            </div>
          )}

          {/* 새 토픽 만들기 */}
          {(isNewTopic || (!isNewSubcategory && topics.length === 0)) && (
            <div className="space-y-4">
              {!isNewSubcategory && topics.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewTopic(false);
                    setTitle("");
                    setDescription("");
                    setSelectedItemIds([]);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  기존 토픽에서 선택
                </button>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  토픽 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 밀짚모자 전투력 랭킹"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required={isNewTopic}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  설명 <span className="text-muted-foreground">(선택)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="토픽에 대한 설명을 입력하세요"
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* 아이템 선택 (기존 소분류일 때만) */}
              {!isNewSubcategory && items.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    아이템 선택
                  </label>
                  {loadingItems ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ItemSelector
                      items={items}
                      selectedIds={selectedItemIds}
                      onChange={setSelectedItemIds}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loadingTopics && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* 제출 */}
      <button
        type="submit"
        disabled={
          submitting ||
          !selectedCategoryId ||
          (!isNewSubcategory && !selectedSubcategoryId) ||
          (isNewTopic && !title.trim()) ||
          (!isNewTopic && !selectedTopicId && !isNewSubcategory)
        }
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            준비 중...
          </span>
        ) : (
          "티어리스트 만들기"
        )}
      </button>
    </form>
  );
}
