

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
  
  body: string;
  
  cover: string;
  
  coverPosition?: string;
  
  publishedAt: string;
  author: ArticleAuthor;
  
  speaker: ArticlePerson;
  tags: string[];
  
  reelId: string;
  relatedIds: string[];
};
