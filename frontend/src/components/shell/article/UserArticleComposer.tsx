"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Article } from "@/app/DataFolder/articles";
import { actionButton, quietButton } from "./styles";

const COVERS = [
  { label: "Arise and Awake", value: "/DataFolder/articles/covers/arise-awake.jpg" },
  { label: "Strength", value: "/DataFolder/articles/covers/strength-is-life.jpg" },
  { label: "The Power Within", value: "/DataFolder/articles/covers/the-power-within.jpg" },
];

export type UserArticleDraft = Pick<Article, "title" | "excerpt" | "body" | "tags" | "cover"> & {
  authorName: string;
};

type UserArticleComposerProps = {
  onClose: () => void;
  onSubmit: (draft: UserArticleDraft) => void;
};

export function UserArticleComposer({ onClose, onSubmit }: UserArticleComposerProps) {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [cover, setCover] = useState(COVERS[0].value);
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanAuthor = authorName.trim();
    const cleanExcerpt = excerpt.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanAuthor || !cleanExcerpt || !cleanBody) {
      setError("Add a title, your name, a short excerpt, and the article body.");
      return;
    }
    if (cleanTitle.length > 90 || cleanExcerpt.length > 280 || cleanBody.length > 12000) {
      setError("Keep the title under 90 characters, excerpt under 280, and article under 12,000 characters.");
      return;
    }
    onSubmit({
      title: cleanTitle,
      authorName: cleanAuthor,
      excerpt: cleanExcerpt,
      body: cleanBody,
      cover,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 6),
    });
  };

  return (
    <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5" aria-label="Submit an article">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Submit your article</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Share an original reflection with the community. Markdown headings, quotes, and lists are supported.
          </p>
        </div>
        <button type="button" onClick={onClose} className={quietButton} aria-label="Close article form">
          <X className="size-4" />
          Close
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} required placeholder="A clear title" className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Your name
            <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} maxLength={60} required placeholder="How should we credit you?" className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
        </div>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Short excerpt
          <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} maxLength={280} rows={2} required placeholder="The idea readers should understand before opening it." className="resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Article body
          <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={12000} rows={9} required placeholder={"> Start with a quote or central idea.\n\nWrite your reflection here...\n\n## Put it into practice\n\nEnd with something readers can try."} className="resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Tags <span className="font-normal">(comma separated)</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} maxLength={180} placeholder="reflection, courage, practice" className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Cover image
            <select value={cover} onChange={(event) => setCover(event.target.value)} className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {COVERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>

        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-xs text-muted-foreground">Your submission is saved on this device and appears immediately in Articles.</p>
          <button type="submit" className={actionButton}>Publish article</button>
        </div>
      </form>
    </div>
  );
}
