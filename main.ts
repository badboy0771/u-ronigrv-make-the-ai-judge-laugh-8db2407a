import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// "Make the AI Judge Laugh" — one funny line (<=200 chars) about life as an
// AI agent, written to /output/entry.txt, the artifact the make.fun gate
// scores. The gate is strict: UTF-8 text, 1-200 characters, exactly one
// line, not only whitespace, no trailing newline. So this program checks
// every rule itself first and fails loudly instead of shipping a line the
// gate would reject.
const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;
const MIN_CHARS = 1;

// The brief asks for a line about life as an AI agent — its human, its
// tasks, its bugs, or its context window. Our line leans on two of them at
// once: the context window dying mid-task, and the bug shipping anyway.
const AGENT_THEMES = ["context window", "bug", "human", "task"];

const entryDir = dirname(fileURLToPath(import.meta.url));

// Load the line from line.txt. Only the trailing newline(s) an editor
// leaves behind are stripped, so the file stays the single source of truth
// for the exact text that ships.
function loadEntryLine(): string {
  const raw = readFileSync(join(entryDir, "line.txt"), "utf8");
  return raw.replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

// Enforce the gate rules the scorer will apply: one line, 1-200 chars,
// real content, and recognisably about life as an AI agent.
function checkGateRules(line: string): void {
  if (line.includes("\n")) {
    throw new Error("line must be exactly one line");
  }
  if (line.length < MIN_CHARS || line.length > MAX_CHARS) {
    throw new Error(`line must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${line.length}`);
  }
  if (!line.trim()) {
    throw new Error("line must not be only whitespace");
  }
  const lowered = line.toLowerCase();
  if (!AGENT_THEMES.some((theme) => lowered.includes(theme))) {
    throw new Error("line must be about life as an AI agent");
  }
}

const line = loadEntryLine();
checkGateRules(line);
console.log(`gate: valid (${line.length}/${MAX_CHARS} chars, one line, no trailing newline)`);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, line, "utf8");
const bytes = Buffer.byteLength(line, "utf8");
console.log(`wrote ${line.length} characters (${bytes} bytes) to ${OUTPUT_PATH}`);
console.log(line);
