"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/tier";

export interface TopicSearchResult {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  subcategory: {
    slug: string;
    name: string;
    category: { slug: string; name: string };
  };
}

export interface SubcategorySearchResult {
  id: string;
  name: string;
  slug: string;
  category: { slug: string; name: string };
}

export interface SearchResults {
  topics: TopicSearchResult[];
  subcategories: SubcategorySearchResult[];
}

export async function searchAll(
  query: string
): Promise<ActionResult<SearchResults>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { data: { topics: [], subcategories: [] }, error: null };
  }

  const supabase = await createClient();
  const pattern = `%${trimmed}%`;

  // Search topics, subcategories, and subcategory aliases in parallel
  const [topicsResult, subcategoriesResult, aliasesResult] = await Promise.all([
    supabase
      .from("topics")
      .select(
        "id, title, slug, description, created_at, subcategory:subcategories(slug, name, category:categories(slug, name))"
      )
      .ilike("title", pattern)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("subcategories")
      .select("id, name, slug, category:categories(slug, name)")
      .ilike("name", pattern)
      .limit(20),
    supabase
      .from("subcategory_aliases")
      .select(
        "subcategory:subcategories(id, name, slug, category:categories(slug, name))"
      )
      .ilike("alias", pattern)
      .limit(20),
  ]);

  if (topicsResult.error) {
    return { data: null, error: topicsResult.error.message };
  }
  if (subcategoriesResult.error) {
    return { data: null, error: subcategoriesResult.error.message };
  }
  if (aliasesResult.error) {
    return { data: null, error: aliasesResult.error.message };
  }

  // Supabase returns single-relation joins as arrays; extract first element
  const topics: TopicSearchResult[] = topicsResult.data.map((t) => {
    const sub = Array.isArray(t.subcategory)
      ? t.subcategory[0]
      : t.subcategory;
    const cat = Array.isArray(sub?.category)
      ? sub.category[0]
      : sub?.category;
    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      description: t.description,
      created_at: t.created_at,
      subcategory: { slug: sub?.slug, name: sub?.name, category: { slug: cat?.slug, name: cat?.name } },
    };
  });

  // Merge subcategory results from name search and alias search, deduplicate
  const subcategoryMap = new Map<string, SubcategorySearchResult>();

  for (const sub of subcategoriesResult.data) {
    const cat = Array.isArray(sub.category)
      ? sub.category[0]
      : sub.category;
    subcategoryMap.set(sub.id, {
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      category: { slug: cat?.slug, name: cat?.name },
    });
  }

  for (const alias of aliasesResult.data) {
    const raw = Array.isArray(alias.subcategory)
      ? alias.subcategory[0]
      : alias.subcategory;
    if (raw && !subcategoryMap.has(raw.id)) {
      const cat = Array.isArray(raw.category)
        ? raw.category[0]
        : raw.category;
      subcategoryMap.set(raw.id, {
        id: raw.id,
        name: raw.name,
        slug: raw.slug,
        category: { slug: cat?.slug, name: cat?.name },
      });
    }
  }

  return {
    data: {
      topics,
      subcategories: Array.from(subcategoryMap.values()),
    },
    error: null,
  };
}
