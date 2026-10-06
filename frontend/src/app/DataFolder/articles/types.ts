// Article records. Import from @/app/DataFolder/articles, not from a component.

export type ArticlePerson = {
  id: string;
  name: string;
};

export type ArticleAuthor = ArticlePerson & {
  role: string;
  bio: string;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  /** Markdown. Same subset Explore uses for reel descriptions. */
  body: string;
  /** Site path. The file lives in frontend/public. */
  cover: string;
  /** CSS object-position, so a crop can keep the subject in frame. */
  coverPosition?: string;
  /** ISO-8601. */
  publishedAt: string;
  author: ArticleAuthor;
  /** Whose words the reading is built on. */
  speaker: ArticlePerson;
  tags: string[];
  /** Explore reel to play until generation exists. */
  reelId: string;
  relatedIds: string[];
};
