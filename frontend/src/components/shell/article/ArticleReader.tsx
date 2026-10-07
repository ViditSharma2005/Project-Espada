import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clapperboard } from "lucide-react";
import { MarkdownBody } from "@/components/shell/explore/MarkdownBody";
import {
  articleHref,
  formatPublished,
  readingMinutes,
  type Article,
} from "@/app/DataFolder/articles";
import { actionButton, quietButton } from "./styles";

type ArticleReaderProps = {
  article: Article;
  related: Article[];
  onBack: () => void;
  onCreateReel: () => void;
};

export function ArticleReader({ article, related, onBack, onCreateReel }: ArticleReaderProps) {
  const minutes = readingMinutes(article.body);

  return (
    <div className="-m-4 sm:-m-6">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <button type="button" onClick={onBack} className={quietButton}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>
        {article.reelId && (
          <button type="button" onClick={onCreateReel} className={actionButton}>
            <Clapperboard className="size-4" aria-hidden="true" />
            Open paired reel
          </button>
        )}
      </div>

      <div className="grid items-start gap-10 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article>
          <p className="text-xs text-muted-foreground">{article.tags.join(" · ")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {article.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {article.speaker.name}
            <span aria-hidden="true"> · </span>
            <time dateTime={article.publishedAt}>{formatPublished(article.publishedAt)}</time>
            <span aria-hidden="true"> · </span>
            {minutes} min read
          </p>

          <div className="relative mt-6 aspect-[16/8] max-h-80 overflow-hidden rounded-md bg-white/[0.04]">
            <Image
              src={article.cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover"
              style={{ objectPosition: article.coverPosition ?? "center" }}
            />
          </div>

          <div className="mt-8 max-w-[44rem]">
            <MarkdownBody source={article.body} />
          </div>
        </article>

        <aside className="border-t border-white/10 pt-6 lg:sticky lg:top-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium"
              aria-hidden="true"
            >
              S
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{article.author.name}</p>
              <p className="text-xs text-muted-foreground">{article.author.role}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.author.bio}</p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            The quoted line is {article.speaker.name}&apos;s. The reading around it is kept here.
          </p>

          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-medium text-muted-foreground">Related</h2>
              <ul className="mt-2">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={articleHref(item.id)}
                      className="-mx-2 block rounded-lg px-2 py-2 outline-none hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="block text-sm font-medium text-foreground">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {formatPublished(item.publishedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
