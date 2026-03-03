import { searchAll } from "@/app/actions/search";
import { SearchResultsContent } from "@/components/search/SearchResultsContent";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? "";

  const result = query.trim() ? await searchAll(query) : null;

  return (
    <SearchResultsContent
      query={query}
      results={result?.data ?? null}
    />
  );
}
