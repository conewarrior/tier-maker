"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, CategoryWithSubcategories } from "@/types/tier";

export async function getCategories(): Promise<
  ActionResult<CategoryWithSubcategories[]>
> {
  const supabase = await createClient();

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (catError) {
    return { data: null, error: catError.message };
  }

  const { data: subcategories, error: subError } = await supabase
    .from("subcategories")
    .select("*")
    .order("created_at");

  if (subError) {
    return { data: null, error: subError.message };
  }

  const result: CategoryWithSubcategories[] = categories.map((cat) => ({
    ...cat,
    subcategories: subcategories.filter((sub) => sub.category_id === cat.id),
  }));

  return { data: result, error: null };
}
