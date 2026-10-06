import { Suspense } from "react";
import { ExploreView } from "@/components/shell/explore/ExploreView";

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="h-full bg-background" />}>
      <ExploreView />
    </Suspense>
  );
}
