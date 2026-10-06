import Image from "next/image";
import Link from "next/link";
import {
  articleHref,
  formatPublished,
  readingMinutes,
  type Article,
} from "@/app/DataFolder/articles";

export function ArticleCard({ article }: { article: Article }) {
  const minutes = readingMinutes(article.body);

  return (
    <li>
      <Link
        href={articleHref(article.id)}
        className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-white/[0.04]">
          <Image
            src={article.cover}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: article.coverPosition ?? "center" }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {article.speaker.name}
          <span aria-hidden="true"> · </span>
          <time dateTime={article.publishedAt}>{formatPublished(article.publishedAt)}</time>
          <span aria-hidden="true"> · </span>
          {minutes} min read
        </p>
        <h2 className="mt-1.5 text-base font-semibold tracking-tight text-foreground group-hover:underline">
          {article.title}
        </h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {article.excerpt}
        </p>
      </Link>
    </li>
  );
}
