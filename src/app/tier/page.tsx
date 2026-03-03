import Link from "next/link";
import {
  Clapperboard,
  Gamepad2,
  Film,
  UtensilsCrossed,
  Trophy,
  Music,
  Package,
  ArrowRight,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  manga: Clapperboard,
  game: Gamepad2,
  movie: Film,
  food: UtensilsCrossed,
  sports: Trophy,
  music: Music,
  etc: Package,
};

const CATEGORY_LIST = [
  { name: "만화/애니", slug: "manga" },
  { name: "게임", slug: "game" },
  { name: "영화/드라마", slug: "movie" },
  { name: "음식", slug: "food" },
  { name: "스포츠", slug: "sports" },
  { name: "음악", slug: "music" },
  { name: "기타", slug: "etc" },
];

export default function TierHomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">티어메이커</h1>
        <p className="text-sm text-muted-foreground">
          다양한 주제로 나만의 티어리스트를 만들고 공유하세요.
        </p>
      </div>

      {/* Quick create */}
      <Link
        href="/tier/create"
        className="flex items-center justify-between rounded-lg border border-border px-5 py-4 transition-colors hover:bg-accent"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            새 토픽 만들기
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            주제를 정하고 아이템을 선택해서 티어를 만들어보세요
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </Link>

      {/* Category grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">카테고리</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {CATEGORY_LIST.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Package;
            return (
              <Link
                key={cat.slug}
                href={`/tier/${cat.slug}`}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-accent"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
