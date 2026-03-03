"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, LogOut, User, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SearchBar } from "./SearchBar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function TopNav() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.is_admin ?? false);
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[var(--nav-height)] items-center border-b border-border bg-background px-4">
      <div className="flex w-[var(--sidebar-width)] shrink-0 items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          sisiduck
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/tier/create"
          className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          <span>만들기</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent"
              >
                <Shield className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/mypage"
              className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center rounded-full bg-secondary px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
