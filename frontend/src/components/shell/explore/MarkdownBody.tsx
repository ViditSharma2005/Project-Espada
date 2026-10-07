
import type { Inline } from "./markdown";
import { parseMarkdown } from "./markdown";

function InlineRun({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((part, index) => {
        const key = `${part.type}-${index}`;
        if (part.type === "strong") {
          return (
            <strong key={key} className="font-medium text-foreground">
              {part.value}
            </strong>
          );
        }
        if (part.type === "em") {
          return <em key={key}>{part.value}</em>;
        }
        if (part.type === "code") {
          return (
            <code
              key={key}
              className="rounded bg-white/[0.06] px-1 py-px font-mono text-[13px]"
            >
              {part.value}
            </code>
          );
        }
        if (part.type === "link") {
          const external = part.href.startsWith("http");
          return (
            <a
              key={key}
              href={part.href}
              className="underline decoration-white/30 underline-offset-2 hover:decoration-white/70"
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {part.label}
            </a>
          );
        }
        return <span key={key}>{part.value}</span>;
      })}
    </>
  );
}

export function MarkdownBody({ source }: { source: string }) {
  const blocks = parseMarkdown(source);

  return (
    <div className="flex flex-col gap-4 text-[15px] leading-[1.65] text-foreground/80">
      {blocks.map((block, index) => {
        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l border-foreground/25 pl-3 text-[16px] leading-[1.6] text-foreground"
            >
              <InlineRun inlines={block.inlines} />
            </blockquote>
          );
        }
        if (block.type === "h") {
          const Tag = block.level === 2 ? "h3" : "h4";
          return (
            <Tag key={index} className="text-[13px] font-semibold text-foreground">
              <InlineRun inlines={block.inlines} />
            </Tag>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type === "ul" ? "ul" : "ol";
          return (
            <Tag
              key={index}
              className={
                block.type === "ul"
                  ? "list-disc space-y-1 pl-5"
                  : "list-decimal space-y-1 pl-5"
              }
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineRun inlines={item} />
                </li>
              ))}
            </Tag>
          );
        }
        if (block.type === "hr") {
          return <hr key={index} className="border-white/10" />;
        }
        return (
          <p key={index}>
            <InlineRun inlines={block.inlines} />
          </p>
        );
      })}
    </div>
  );
}
