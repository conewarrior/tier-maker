"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flame,
  Sparkles,
  Clapperboard,
  Gamepad2,
  Film,
  UtensilsCrossed,
  Trophy,
  Music,
  Package,
  ChevronRight,
} from "lucide-react";
import { getCategories } from "@/app/actions/category";
import type { CategoryWithSubcategories } from "@/types/tier";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "홈", href: "/", icon: Home },
  { label: "인기", href: "/tier/popular", icon: Flame },
  { label: "최신", href: "/tier/latest", icon: Sparkles },
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  manga: Clapperboard,
  game: Gamepad2,
  movie: Film,
  food: UtensilsCrossed,
  sports: Trophy,
  music: Music,
  etc: Package,
};

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const result = await getCategories();
      if (result.data) {
        setCategories(result.data);
      }
    }
    load();
  }, []);

  // Auto-expand the category that matches the current path
  useEffect(() => {
    const match = pathname.match(/^\/tier\/([^/]+)/);
    if (match) {
      setExpandedSlugs((prev) => new Set([...prev, match[1]]));
    }
  }, [pathname]);

  const toggleCategory = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  return (
    <aside className="fixed top-[var(--nav-height)] left-0 flex h-[calc(100vh-var(--nav-height))] w-[var(--sidebar-width)] flex-col overflow-y-auto border-r border-border bg-background py-4">
      <nav className="flex flex-col gap-0.5 px-3">
        {mainNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-3">
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          카테고리
        </h3>
        <nav className="flex flex-col gap-0.5">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Package;
            const isExpanded = expandedSlugs.has(cat.slug);
            const isActive = pathname.startsWith(`/tier/${cat.slug}`);

            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.slug)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{cat.name}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </button>

                {isExpanded && cat.subcategories.length > 0 && (
                  <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/tier/${cat.slug}/${sub.slug}`}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm transition-colors",
                          pathname === `/tier/${cat.slug}/${sub.slug}`
                            ? "bg-accent font-medium text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
