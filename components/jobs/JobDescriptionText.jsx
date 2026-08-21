import { CheckCircle2 } from "lucide-react";

// Descriptions arrive as plain, newline-delimited text (backend/apify_client.py's
// clean_html_description() already stripped any real HTML structure) — there's
// no markup left to key off, so headings/list items are recovered heuristically
// line-by-line: a short line matching a common JD section name is a heading, a
// short "Label: value" line bolds just the label, and everything else becomes a
// checklist-style line (most LinkedIn/Dice descriptions are already essentially
// one bullet per line once HTML block tags become newlines).
const HEADING_PATTERN = /^(job overview|job (title|summary)|role type|primary focus|key responsibilities|responsibilities|required (technical )?skills|required experience|requirements?|qualifications?|preferred qualifications|about (the role|us)|what you.ll do|what we.re looking for|who you are|benefits|perks|nice to have)s?:?$/i;
const LABEL_PATTERN = /^([A-Z][A-Za-z /&]{2,40}):\s*(.+)$/;

function classifyLine(rawLine) {
  const line = rawLine.trim();
  if (!line) return { type: "blank" };
  if (line.length <= 60 && HEADING_PATTERN.test(line.replace(/:$/, ""))) {
    return { type: "heading", text: line.replace(/:$/, "") };
  }
  const labelMatch = line.match(LABEL_PATTERN);
  if (labelMatch && line.length <= 120) {
    return { type: "label", label: labelMatch[1], value: labelMatch[2] };
  }
  return { type: "item", text: line };
}

export function JobDescriptionText({ text }) {
  if (!text) return <p className="text-sm text-muted-foreground">No description available.</p>;

  const blocks = [];
  let currentList = null;
  for (const rawLine of text.split("\n")) {
    const line = classifyLine(rawLine);
    if (line.type === "item") {
      if (!currentList) {
        currentList = { type: "list", items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(line.text);
    } else {
      currentList = null;
      if (line.type !== "blank") blocks.push(line);
    }
  }

  return <div className="flex flex-col gap-2 text-sm leading-relaxed text-foreground">
      {blocks.map((block, i) => {
      if (block.type === "heading") {
        return <p key={i} className="mt-3 font-semibold text-foreground first:mt-0">{block.text}</p>;
      }
      if (block.type === "label") {
        return <p key={i}>
              <span className="font-semibold">{block.label}:</span> {block.value}
            </p>;
      }
      return <ul key={i} className="flex flex-col gap-1.5">
            {block.items.map((item, j) => <li key={j} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{item}</span>
              </li>)}
          </ul>;
    })}
    </div>;
}
