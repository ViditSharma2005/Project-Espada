// A small markdown subset for reel descriptions. No raw HTML.

export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

export type Block =
  | { type: "p"; inlines: Inline[] }
  | { type: "h"; level: 2 | 3; inlines: Inline[] }
  | { type: "quote"; inlines: Inline[] }
  | { type: "ul"; items: Inline[][] }
  | { type: "ol"; items: Inline[][] }
  | { type: "hr" };

function isSafeHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");
}

export function parseInline(input: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = "";

  const flush = () => {
    if (!buf) return;
    out.push({ type: "text", value: buf });
    buf = "";
  };

  while (i < input.length) {
    if (input.startsWith("**", i)) {
      const end = input.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        out.push({ type: "strong", value: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    if (input[i] === "*" && input[i + 1] !== "*") {
      const end = input.indexOf("*", i + 1);
      if (end !== -1) {
        flush();
        out.push({ type: "em", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (input[i] === "`") {
      const end = input.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        out.push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (input[i] === "[") {
      const match = input.slice(i).match(/^\[([^\]]+)\]\(([^)\s]+)\)/);
      if (match && isSafeHref(match[2])) {
        flush();
        out.push({ type: "link", label: match[1], href: match[2] });
        i += match[0].length;
        continue;
      }
    }

    buf += input[i];
    i += 1;
  }

  flush();
  return out;
}

function isSpecial(line: string): boolean {
  return (
    /^#{1,3}\s+/.test(line) ||
    line.startsWith(">") ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    line.trim() === "---"
  );
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: "h",
        level: heading[1].length === 2 ? 2 : 3,
        inlines: parseInline(heading[2]),
      });
      i += 1;
      continue;
    }

    if (line.trim() === "---") {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        parts.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", inlines: parseInline(parts.join(" ")) });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^[-*]\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\.\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const para = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== "" && !isSpecial(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "p", inlines: parseInline(para.join(" ")) });
  }

  return blocks;
}
