import Link from "next/link";
import { SearchX, FolderOpen, FileText } from "lucide-react";
import type {
  SearchResults,
  TopicSearchResult,
  SubcategorySearchResult,
} from "@/app/actions/search";

interface SearchResultsContentProps {
  query: string;
  results: SearchResults | null;
}

export function SearchResultsContent({
  query,
  results,
}: SearchResultsContentProps) {
  if (!query.trim()) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <p className="text-sm text-muted-foreground">검색어를 입력해주세요.</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <p className="text-sm text-muted-foreground">
          검색 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  const hasResults =
    results.topics.length > 0 || results.subcategories.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-lg font-bold text-foreground">
          &ldquo;{query}&rdquo; 검색 결과
        </h1>
        {!hasResults && (
          <p className="mt-1 text-sm text-muted-foreground">
            검색 결과가 없습니다.
          </p>
        )}
      </div>

      {!hasResults && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border px-6 py-12">
          <SearchX className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            다른 검색어로 시도해보세요.
          </p>
        </div>
      )}

      {results.subcategories.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FolderOpen className="h-4 w-4" />
            소분류
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.subcategories.map((sub) => (
              <SubcategoryResult key={sub.id} subcategory={sub} />
            ))}
          </div>
        </div>
      )}

      {results.topics.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4" />
            토픽
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.topics.map((topic) => (
              <TopicResult key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubcategoryResult({
  subcategory,
}: {
  subcategory: SubcategorySearchResult;
}) {
  return (
    <Link
      href={`/tier/${subcategory.category.slug}/${subcategory.slug}`}
      className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent"
    >
      <h3 className="text-sm font-semibold text-foreground">
        {subcategory.name}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {subcategory.category.name}
      </p>
    </Link>
  );
}

function TopicResult({ topic }: { topic: TopicSearchResult }) {
  return (
    <Link
      href={`/tier/${topic.subcategory.category.slug}/${topic.subcategory.slug}/${topic.slug}`}
      className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent"
    >
      <h3 className="text-sm font-semibold text-foreground">{topic.title}</h3>
      {topic.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {topic.description}
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {topic.subcategory.category.name} &gt; {topic.subcategory.name}
      </p>
    </Link>
  );
}
