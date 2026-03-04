"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, Loader2, Pencil, Check, X, ArrowRightLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAdminCategories,
  getAdminSubcategories,
  getAdminTopics,
  getAdminItems,
  deleteCategory,
  deleteSubcategory,
  deleteTopic,
  deleteItem,
  createCategory,
  updateCategory,
  createAdminSubcategory,
  moveSubcategory,
} from "@/app/actions/admin";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  subcategory_count: number;
};
type Subcategory = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string;
  item_count: number;
  topic_count: number;
  created_at: string;
};
type Topic = {
  id: string;
  title: string;
  slug: string;
  subcategory_name: string;
  tier_list_count: number;
  created_at: string;
};
type Item = {
  id: string;
  name: string;
  image_url: string;
  subcategory_name: string;
  created_at: string;
};

export function AdminContent() {
  const [activeTab, setActiveTab] = useState("categories");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Category edit/add state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  // Subcategory add/move state
  const [addingSub, setAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [newSubCategoryId, setNewSubCategoryId] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveCategoryId, setMoveCategoryId] = useState("");

  const loadTab = useCallback(
    async (tab: string) => {
      setLoading(true);
      switch (tab) {
        case "categories": {
          const res = await getAdminCategories();
          if (res.data) setCategories(res.data);
          break;
        }
        case "subcategories": {
          const [subRes, catRes] = await Promise.all([
            getAdminSubcategories(),
            getAdminCategories(),
          ]);
          if (subRes.data) setSubcategories(subRes.data);
          if (catRes.data) setCategories(catRes.data);
          break;
        }
        case "topics": {
          const res = await getAdminTopics();
          if (res.data) setTopics(res.data);
          break;
        }
        case "items": {
          const res = await getAdminItems();
          if (res.data) setItems(res.data);
          break;
        }
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const handleDelete = async (
    type: string,
    id: string,
    name: string
  ) => {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까? 하위 데이터도 모두 삭제됩니다.`))
      return;

    setDeleting(id);
    let result;
    switch (type) {
      case "category":
        result = await deleteCategory(id);
        break;
      case "subcategory":
        result = await deleteSubcategory(id);
        break;
      case "topic":
        result = await deleteTopic(id);
        break;
      case "item":
        result = await deleteItem(id);
        break;
    }
    if (result?.error) {
      alert(result.error);
    } else {
      await loadTab(activeTab);
    }
    setDeleting(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const result = await updateCategory(editingId, {
      name: editName,
      slug: editSlug,
      sort_order: editOrder,
    });
    if (result.error) {
      alert(result.error);
    } else {
      setEditingId(null);
      await loadTab("categories");
    }
    setSaving(false);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setSaving(true);
    const result = await createCategory({
      name: newName.trim(),
      slug: newSlug.trim(),
      sort_order: newOrder,
    });
    if (result.error) {
      alert(result.error);
    } else {
      setAdding(false);
      setNewName("");
      setNewSlug("");
      setNewOrder(0);
      await loadTab("categories");
    }
    setSaving(false);
  };

  const handleAddSub = async () => {
    if (!newSubName.trim() || !newSubSlug.trim() || !newSubCategoryId) return;
    setSaving(true);
    const result = await createAdminSubcategory({
      categoryId: newSubCategoryId,
      name: newSubName.trim(),
      slug: newSubSlug.trim(),
    });
    if (result.error) {
      alert(result.error);
    } else {
      setAddingSub(false);
      setNewSubName("");
      setNewSubSlug("");
      setNewSubCategoryId("");
      await loadTab("subcategories");
    }
    setSaving(false);
  };

  const handleMove = async (subcategoryId: string, targetCategoryId: string) => {
    setSaving(true);
    const result = await moveSubcategory(subcategoryId, targetCategoryId);
    if (result.error) {
      alert(result.error);
    } else {
      setMovingId(null);
      setMoveCategoryId("");
      await loadTab("subcategories");
    }
    setSaving(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="categories">카테고리</TabsTrigger>
        <TabsTrigger value="subcategories">소분류</TabsTrigger>
        <TabsTrigger value="topics">토픽</TabsTrigger>
        <TabsTrigger value="items">아이템</TabsTrigger>
      </TabsList>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Categories */}
          <TabsContent value="categories">
            <div className="mb-3 flex justify-end">
              {!adding && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdding(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  카테고리 추가
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>순서</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>slug</TableHead>
                  <TableHead>소분류 수</TableHead>
                  <TableHead className="w-[100px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adding && (
                  <TableRow>
                    <TableCell>
                      <input
                        type="number"
                        value={newOrder}
                        onChange={(e) => setNewOrder(Number(e.target.value))}
                        className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="이름"
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        placeholder="slug"
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={handleAdd}
                          disabled={saving}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setAdding(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      {editingId === cat.id ? (
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) =>
                            setEditOrder(Number(e.target.value))
                          }
                          className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
                        />
                      ) : (
                        cat.sort_order
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                        />
                      ) : (
                        cat.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                        />
                      ) : (
                        <code className="text-xs">{cat.slug}</code>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {cat.subcategory_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editingId === cat.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={handleSaveEdit}
                              disabled={saving}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setEditingId(cat.id);
                                setEditName(cat.name);
                                setEditSlug(cat.slug);
                                setEditOrder(cat.sort_order);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                handleDelete("category", cat.id, cat.name)
                              }
                              disabled={deleting === cat.id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Subcategories */}
          <TabsContent value="subcategories">
            <div className="mb-3 flex justify-end">
              {!addingSub && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingSub(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  소분류 추가
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>slug</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>아이템</TableHead>
                  <TableHead>토픽</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="w-[100px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addingSub && (
                  <TableRow>
                    <TableCell>
                      <input
                        type="text"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        placeholder="이름"
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={newSubSlug}
                        onChange={(e) => setNewSubSlug(e.target.value)}
                        placeholder="slug"
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={newSubCategoryId}
                        onChange={(e) => setNewSubCategoryId(e.target.value)}
                        className="rounded border border-border bg-background px-2 py-1 text-sm"
                      >
                        <option value="">선택</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={handleAddSub}
                          disabled={saving}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setAddingSub(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {subcategories.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{sub.slug}</code>
                    </TableCell>
                    <TableCell>
                      {movingId === sub.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={moveCategoryId}
                            onChange={(e) => setMoveCategoryId(e.target.value)}
                            className="rounded border border-border bg-background px-2 py-1 text-sm"
                          >
                            <option value="">이동할 대분류</option>
                            {categories
                              .filter((cat) => cat.id !== sub.category_id)
                              .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              moveCategoryId &&
                              handleMove(sub.id, moveCategoryId)
                            }
                            disabled={saving || !moveCategoryId}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setMovingId(null);
                              setMoveCategoryId("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline">{sub.category_name}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{sub.item_count}</TableCell>
                    <TableCell>{sub.topic_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(sub.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setMovingId(sub.id);
                            setMoveCategoryId("");
                          }}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            handleDelete("subcategory", sub.id, sub.name)
                          }
                          disabled={deleting === sub.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {subcategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      소분류가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Topics */}
          <TabsContent value="topics">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>소분류</TableHead>
                  <TableHead>티어리스트</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="w-[60px]">삭제</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">
                      {topic.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {topic.subcategory_name}
                      </Badge>
                    </TableCell>
                    <TableCell>{topic.tier_list_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(topic.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          handleDelete("topic", topic.id, topic.title)
                        }
                        disabled={deleting === topic.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {topics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      토픽이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Items */}
          <TabsContent value="items">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">이미지</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>소분류</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="w-[60px]">삭제</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.subcategory_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          handleDelete("item", item.id, item.name)
                        }
                        disabled={deleting === item.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      아이템이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}
