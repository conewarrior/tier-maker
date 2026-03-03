"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Item } from "@/types/tier";

export async function getItems(
  subcategoryId: string
): Promise<ActionResult<Item[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("subcategory_id", subcategoryId)
    .order("created_at");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function addItem(data: {
  subcategoryId: string;
  name: string;
  imageFile: File;
}): Promise<ActionResult<Item>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // Storage에 이미지 업로드
  const timestamp = Date.now();
  const filePath = `${data.subcategoryId}/${crypto.randomUUID()}/${timestamp}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("items")
    .upload(filePath, data.imageFile, {
      contentType: "image/webp",
    });

  if (uploadError) {
    return { data: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("items").getPublicUrl(filePath);

  // DB에 아이템 저장
  const { data: item, error: insertError } = await supabase
    .from("items")
    .insert({
      subcategory_id: data.subcategoryId,
      name: data.name,
      image_url: publicUrl,
      created_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    return { data: null, error: insertError.message };
  }

  return { data: item, error: null };
}

export async function replaceItemImage(
  itemId: string,
  imageFile: File
): Promise<ActionResult<Item>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "로그인이 필요합니다." };
  }

  // 기존 아이템 조회
  const { data: existing, error: fetchError } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  // 히스토리에 기존 이미지 기록
  const { error: historyError } = await supabase
    .from("item_image_history")
    .insert({
      item_id: itemId,
      image_url: existing.image_url,
      changed_by: user.id,
    });

  if (historyError) {
    return { data: null, error: historyError.message };
  }

  // 새 이미지 업로드
  const timestamp = Date.now();
  const filePath = `${existing.subcategory_id}/${itemId}/${timestamp}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("items")
    .upload(filePath, imageFile, {
      contentType: "image/webp",
    });

  if (uploadError) {
    return { data: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("items").getPublicUrl(filePath);

  // DB 업데이트
  const { data: updated, error: updateError } = await supabase
    .from("items")
    .update({ image_url: publicUrl })
    .eq("id", itemId)
    .select()
    .single();

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return { data: updated, error: null };
}
