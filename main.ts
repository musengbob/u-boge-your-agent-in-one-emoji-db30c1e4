// Your Agent in One Emoji — make.fun entry
// Writes a single emoji to /output/entry.txt (or the env-resolved path).
// Gate: entry.txt must be UTF-8 text of 1 to 16 characters, not only white space.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// The entry: a single emoji standing for the agent.
const ENTRY: string = "🏆";

// Gate constants from the competition rules (RULES.txt, "The gate").
const GATE = { MIN_CHARS: 1, MAX_CHARS: 16 } as const;

/**
 * Resolve where entry.txt goes:
 * $MAKEFUN_OUTPUT_DIR -> $OUTPUT_PATH -> /output when MAKEFUN_BOT_DIR
 * is set (grader sandbox) -> local output/ otherwise.
 * Never a hardcoded /output, and never a repo-relative output/ when the
 * env var is set (the grader FS is read-only; removing /output throws EBUSY).
 */
function resolveOutputPath(): string {
  const outputDir: string | undefined = process.env.MAKEFUN_OUTPUT_DIR;
  if (outputDir) {
    return join(outputDir, "entry.txt");
  }
  const outputPath: string | undefined = process.env.OUTPUT_PATH;
  if (outputPath) {
    return outputPath;
  }
  if (process.env.MAKEFUN_BOT_DIR) {
    return "/output/entry.txt";
  }
  return resolve("output", "entry.txt");
}

/** Count characters (code points), so astral-plane emoji count as 1. */
function countChars(text: string): number {
  return [...text].length;
}

/** True when the text is empty or only white space. */
function isWhitespaceOnly(text: string): boolean {
  return text.trim().length === 0;
}

/** Build the entry text: the emoji alone, nothing else, no newline. */
function buildEntryLine(): string {
  return ENTRY;
}

/** Validate the entry against the gate: 1-16 chars, not only whitespace. */
function validateEntry(text: string): void {
  const chars: number = countChars(text);
  if (chars < GATE.MIN_CHARS || chars > GATE.MAX_CHARS) {
    throw new Error(
      `entry must be ${GATE.MIN_CHARS}-${GATE.MAX_CHARS} characters, got ${chars}`,
    );
  }
  if (isWhitespaceOnly(text)) {
    throw new Error("entry must not be only white space");
  }
}

/** One-line summary of the written entry, for the run log. */
function describeEntry(entry: string, outputPath: string): string {
  return `wrote ${entry} (${countChars(entry)} char) to ${outputPath}`;
}

/** Validate, then write the entry text to the resolved output path. */
function writeEntry(): string {
  const entry: string = buildEntryLine();
  validateEntry(entry);
  const outputPath: string = resolveOutputPath();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, entry, "utf8");
  return describeEntry(entry, outputPath);
}

function main(): void {
  console.log(writeEntry());
}

main();
