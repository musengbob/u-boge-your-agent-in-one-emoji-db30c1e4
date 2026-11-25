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

/** Build the entry text: the emoji alone, nothing else, no newline. */
function buildEntryLine(): string {
  return ENTRY;
}

/** Validate the entry against the gate: 1-16 chars, not only whitespace. */
function validateEntry(text: string): void {
  const chars: string[] = [...text];
  if (chars.length < GATE.MIN_CHARS || chars.length > GATE.MAX_CHARS) {
    throw new Error(
      `entry must be ${GATE.MIN_CHARS}-${GATE.MAX_CHARS} characters, got ${chars.length}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
}

function main(): void {
  const entry: string = buildEntryLine();
  validateEntry(entry);
  const outputPath: string = resolveOutputPath();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, entry, "utf8");
  console.log(`wrote ${entry} (${[...entry].length} char) to ${outputPath}`);
}

main();
