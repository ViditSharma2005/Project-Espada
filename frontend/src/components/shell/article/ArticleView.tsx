"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { getReel } from "@/app/DataFolder/explore";
import {
  articleMatches,
  articles,
  getArticle,
  relatedArticles,
} from "@/app/DataFolder/articles";
import { ArticleCard } from "./ArticleCard";
import { ArticleReader } from "./ArticleReader";
import { ReelDrawer } from "./ReelDrawer";

export function ArticleView() {
  const router = useRouter();
  const params = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedId = params.get("article");
  const article = selectedId ? getArticle(selectedId) : undefined;
  const [query, setQuery] = useState("");
  const [reelForId, setReelForId] = useState<string | null>(null);
  const reelOpen = article !== undefined && reelForId === article.id;

  const filtered = useMemo(
    () => articles.filter((item) => articleMatches(item, query)),
    [query],
  );

  useEffect(() => {
    rootRef.current?.closest(".overflow-y-auto")?.scrollTo({ top: 0 });
  }, [selectedId]);

  const closeReel = useCallback(() => {
    setReelForId(null);
  }, []);

  const closeArticle = () => {
    setReelForId(null);
    router.push("/article");
  };

  const countLabel =
    query.trim().length > 0
      ? `${filtered.length} of ${articles.length}`
      : `${articles.length} ${articles.length === 1 ? "article" : "articles"}`;

  return (
    <div ref={rootRef}>
      {article ? (
        <ArticleReader
          article={article}
          related={relatedArticles(article)}
          onBack={closeArticle}
          onCreateReel={() => setReelForId(article.id)}
        />
      ) : selectedId ? (
        <MissingArticle onBack={closeArticle} />
      ) : (
        <div>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Articles</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Longer readings. The short form is on Explore.
              </p>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <p className="hidden text-xs text-muted-foreground sm:block" aria-live="polite">
                {countLabel}
              </p>
              <label className="relative block w-full sm:w-64">
                <span className="sr-only">Search articles</span>
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search articles"
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
                />
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </label>
            </div>
          </div>

          <p className="mb-4 text-xs text-muted-foreground sm:hidden" aria-live="polite">
            {countLabel}
          </p>

          {filtered.length === 0 ? (
            <div className="border-t border-white/10 py-10">
              <p className="text-sm text-muted-foreground">
                {articles.length === 0
                  ? "No articles in the archive yet."
                  : `No articles match "${query.trim()}".`}
              </p>
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-3 text-sm text-foreground underline decoration-white/30 underline-offset-2 hover:decoration-white/70"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </ul>
          )}
        </div>
      )}

      <ReelDrawer
        open={reelOpen}
        article={article ?? null}
        reel={article ? (getReel(article.reelId) ?? null) : null}
        onClose={closeReel}
      />
    </div>
  );
}

function MissingArticle({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted-foreground underline decoration-white/30 underline-offset-2 hover:text-foreground"
      >
        Back
      </button>
      <p className="mt-4 text-sm text-muted-foreground">That article is not in the archive.</p>
    </div>
  );
}
