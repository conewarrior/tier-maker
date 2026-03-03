import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyPageContent } from "@/components/mypage/MyPageContent";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        nickname:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      }, { onConflict: "id" })
      .select()
      .single();
    profile = newProfile;
  }

  if (!profile) {
    redirect("/login");
  }

  return <MyPageContent profile={profile} />;
}
