// src/components/shell/explore/ReelReading.tsx — description of the current reel.
import type { Reel } from "@/app/DataFolder/explore";
import { cn } from "@/lib/utils";
import { MarkdownBody } from "./MarkdownBody";

export function ReelReading({
  reel,
  className,
  generatedExplanation,
}: {
  reel: Reel;
  className?: string;
  generatedExplanation?: string;
}) {
  return (
    <section aria-label="Reading" className={cn("flex min-h-0 flex-col", className)}>
      <h2
        aria-live="polite"
        className="shrink-0 px-5 pt-5 text-[17px] font-semibold tracking-tight text-foreground sm:px-6"
      >
        {reel.title}
      </h2>
      <div
        data-reel-reading
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4 sm:px-6"
      >
        <div className="max-w-[40rem]">
          <MarkdownBody
            source={
              generatedExplanation
                ? `${reel.description}\n\n## Why this fits your prompt\n\n${generatedExplanation}`
                : reel.description
            }
          />
        </div>
      </div>
    </section>
  );
}
