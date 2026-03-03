"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import { getCategories } from "@/app/actions/category";
import { getItems } from "@/app/actions/item";
import { createSubcategory } from "@/app/actions/subcategory";
import { createTopic } from "@/app/actions/topic";
import type { CategoryWithSubcategories, Item } from "@/types/tier";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  useEffect(() => {
    if (!selectedSubcategoryId || isNewSubcategory) {
      setItems([]);
      setSelectedItemIds([]);
      return;
    }
    async function loadItems() {
      setLoadingItems(true);
      const result = await getItems(selectedSubcategoryId);
      if (result.data) {
        setItems(result.data);
      }
      setLoadingItems(false);
    }
    loadItems();
  }, [selectedSubcategoryId, isNewSubcategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let subcategoryId = selectedSubcategoryId;

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
      }

      if (!subcategoryId) {
        setError("소분류를 선택하거나 새로 만들어주세요.");
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

      const category = categories.find((c) => c.id === selectedCategoryId);
      const subcategory = isNewSubcategory
        ? { slug: result.data!.slug }
        : category?.subcategories.find((s) => s.id === subcategoryId);

      router.push(
        `/tier/${category?.slug}/${subcategory?.slug}/${result.data!.slug}`
      );
    } catch {
      setError("토픽 생성에 실패했습니다.");
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
      <h1 className="text-xl font-bold text-foreground">토픽 만들기</h1>

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
                  onChange={(e) => setSelectedSubcategoryId(e.target.value)}
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

      {/* 제목 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">토픽 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 밀짚모자 전투력 랭킹"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          설명 <span className="text-muted-foreground">(선택)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="토픽에 대한 설명을 입력하세요"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* 아이템 선택 */}
      {selectedSubcategoryId && !isNewSubcategory && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
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

      {/* 제출 */}
      <button
        type="submit"
        disabled={submitting || !title.trim() || !selectedCategoryId}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            생성 중...
          </span>
        ) : (
          "토픽 만들기"
        )}
      </button>
    </form>
  );
}
