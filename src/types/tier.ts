// DB 테이블 대응 TypeScript 타입

export interface Profile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  normalized_name: string;
  created_by: string | null;
  created_at: string;
}

export interface SubcategoryAlias {
  id: string;
  subcategory_id: string;
  alias: string;
  normalized_alias: string;
}

export interface Item {
  id: string;
  subcategory_id: string;
  name: string;
  image_url: string;
  created_by: string | null;
  created_at: string;
}

export interface ItemImageHistory {
  id: string;
  item_id: string;
  image_url: string;
  changed_by: string | null;
  changed_at: string;
}

export interface Topic {
  id: string;
  subcategory_id: string;
  title: string;
  slug: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TopicItem {
  topic_id: string;
  item_id: string;
}

export interface TierList {
  id: string;
  topic_id: string;
  user_id: string;
  created_at: string;
}

export interface TierRanking {
  id: string;
  tier_list_id: string;
  item_id: string;
  tier: string;
  position: number;
}

export interface Like {
  user_id: string;
  tier_list_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  tier_list_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// 조합 타입 (조인 결과)

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface TopicWithItems extends Topic {
  items: Item[];
}

export interface TierListWithRankings extends TierList {
  rankings: (TierRanking & { item: Item })[];
  user: Profile;
  like_count: number;
}

// 티어 에디터용 타입

export interface TierItem {
  id: string;
  name: string;
  imageUrl: string;
}

export interface TierRowConfig {
  id: string;
  name: string;
  color: string;
}

export type TierState = {
  [tier: string]: string[];
};

// Server Action 반환 타입

export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };
