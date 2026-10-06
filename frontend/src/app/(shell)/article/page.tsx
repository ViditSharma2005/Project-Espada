import { Suspense } from "react";
import { ArticleView } from "@/components/shell/article/ArticleView";

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading articles...</div>}>
      <ArticleView />
    </Suspense>
  );
}
