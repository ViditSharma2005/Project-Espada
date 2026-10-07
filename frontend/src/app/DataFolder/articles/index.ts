

import raw from "./catalog.json";
import type { Article, ArticleAuthor, ArticlePerson } from "./types";

function isPerson(value: unknown): value is ArticlePerson {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && row.id.length > 0 && typeof row.name === "string";
}

function isAuthor(value: unknown): value is ArticleAuthor {
  if (!isPerson(value)) return false;
  const row = value as unknown as Record<string, unknown>;
  return typeof row.role === "string" && typeof row.bio === "string";
}

function isArticle(value: unknown): value is Article {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.title === "string" &&
    typeof row.excerpt === "string" &&
    typeof row.body === "string" &&
    typeof row.cover === "string" &&
    typeof row.publishedAt === "string" &&
    typeof row.reelId === "string" &&
    Array.isArray(row.tags) &&
    row.tags.every((tag) => typeof tag === "string") &&
    Array.isArray(row.relatedIds) &&
    row.relatedIds.every((id) => typeof id === "string") &&
    isAuthor(row.author) &&
    isPerson(row.speaker)
  );
}

const byDate = (a: Article, b: Article) =>
  b.publishedAt < a.publishedAt ? -1 : b.publishedAt > a.publishedAt ? 1 : 0;

export const articles: Article[] = (raw as unknown[]).filter(isArticle).sort(byDate);

const byId = new Map(articles.map((article) => [article.id, article]));

export function getArticle(id: string): Article | undefined {
  return byId.get(id);
}

export function articleHref(id: string): string {
  return `/article?article=${encodeURIComponent(id)}`;
}

export function relatedArticles(article: Article): Article[] {
  return article.relatedIds
    .map((id) => byId.get(id))
    .filter((item): item is Article => item !== undefined && item.id !== article.id);
}

export function articleMatches(article: Article, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [
    article.title,
    article.excerpt,
    article.body,
    article.author.name,
    article.speaker.name,
    article.tags.join(" "),
  ]
    .join("\n")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export type { Article, ArticleAuthor, ArticlePerson } from "./types";
export { formatPublished, readingMinutes } from "./format";
