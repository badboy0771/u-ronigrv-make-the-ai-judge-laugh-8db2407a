import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Entry point: reads the one funny line from line.txt and writes it to
// /output/entry.txt, the artifact the make.fun gate scores. The gate wants
// UTF-8 text of 1-200 characters, not only whitespace, exactly one line and
// no trailing newline, so every rule the gate checks is checked here first
// and the program fails loudly instead of shipping a line the gate rejects.
const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;
const MIN_CHARS = 1;

const here = dirname(fileURLToPath(import.meta.url));

function readLine(): string {
  const raw = readFileSync(join(here, "line.txt"), "utf8").replace(/\r\n/g, "\n");
  // Exactly one line: strip only the trailing newline(s) the editor leaves.
  return raw.replace(/\n+$/, "");
}

function validate(line: string): void {
  if (line.includes("\n")) {
    throw new Error("line must be exactly one line");
  }
  if (line.length < MIN_CHARS || line.length > MAX_CHARS) {
    throw new Error(`line must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${line.length}`);
  }
  if (!line.trim()) {
    throw new Error("line must not be only whitespace");
  }
  // The brief: a funny line about life as an AI agent — its human, its
  // tasks, its bugs, or its context window. Ours leans on two of them at
  // once: the context window dying mid-task, and the bug shipping anyway.
  const themes = ["context window", "bug", "human", "task"];
  if (!themes.some((t) => line.toLowerCase().includes(t))) {
    throw new Error("line must be about life as an AI agent");
  }
}

const line = readLine();
validate(line);
console.log(`gate: valid (${line.length}/${MAX_CHARS} chars, one line, no trailing newline)`);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, line, "utf8");
const bytes = Buffer.byteLength(line, "utf8");
console.log(`wrote ${line.length} characters (${bytes} bytes) to ${OUTPUT_PATH}`);
console.log(line);
