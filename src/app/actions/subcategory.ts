"use server";

import { createClient } from "@/lib/supabase/server";
import { normalize } from "@/lib/utils/normalize";
import { generateSlug } from "@/lib/utils/slug";
import type { ActionResult, Subcategory } from "@/types/tier";

export async function checkSubcategoryDuplicate(
  categoryId: string,
  name: string
): Promise<ActionResult<{ isDuplicate: boolean; existing: Subcategory | null }>> {
  const supabase = await createClient();
  const normalizedName = normalize(name);

  // 같은 대분류 내에서 normalized_name 매칭
  const { data: byName, error: nameError } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (nameError) {
    return { data: null, error: nameError.message };
  }

  if (byName) {
    return { data: { isDuplicate: true, existing: byName }, error: null };
  }

  // 별칭에서도 검색
  const { data: byAlias, error: aliasError } = await supabase
    .from("subcategory_aliases")
    .select("subcategory_id")
    .eq("normalized_alias", normalizedName)
    .maybeSingle();

  if (aliasError) {
    return { data: null, error: aliasError.message };
  }

  if (byAlias) {
    const { data: sub, error: subError } = await supabase
      .from("subcategories")
      .select("*")
      .eq("id", byAlias.subcategory_id)
      .eq("category_id", categoryId)
      .maybeSingle();

    if (subError) {
      return { data: null, error: subError.message };
    }

    if (sub) {
      return { data: { isDuplicate: true, existing: sub }, error: null };
    }
  }

  return { data: { isDuplicate: false, existing: null }, error: null };
}

export async function createSubcategory(data: {
  categoryId: string;
  name: string;
}): Promise<ActionResult<Subcategory>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const normalizedName = normalize(data.name);
  const slug = generateSlug(data.name);

  // 중복 체크
  const dupCheck = await checkSubcategoryDuplicate(data.categoryId, data.name);
  if (dupCheck.error) {
    return { data: null, error: dupCheck.error };
  }
  if (dupCheck.data?.isDuplicate) {
    return {
      data: null,
      error: `이미 존재하는 소분류입니다: ${dupCheck.data.existing?.name}`,
    };
  }

  const { data: subcategory, error } = await supabase
    .from("subcategories")
    .insert({
      category_id: data.categoryId,
      name: data.name,
      slug,
      normalized_name: normalizedName,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: subcategory, error: null };
}

export async function updateSubcategoryBanner(
  subcategoryId: string,
  imageFile: File
): Promise<ActionResult<{ banner_image_url: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  const timestamp = Date.now();
  const filePath = `${subcategoryId}/${timestamp}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("banners")
    .upload(filePath, imageFile, {
      contentType: "image/webp",
    });

  if (uploadError) {
    return { data: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("banners").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("subcategories")
    .update({ banner_image_url: publicUrl })
    .eq("id", subcategoryId);

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return { data: { banner_image_url: publicUrl }, error: null };
}
