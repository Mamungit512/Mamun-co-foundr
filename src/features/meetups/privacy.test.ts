import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Static guardrails for student data in the meetups feature. These read the
 * source, so a future edit that logs the note, adds analytics, or shows the
 * note to admins fails here instead of in production.
 */

const SRC = path.resolve(__dirname, "../..");
const rel = (p: string) => path.relative(SRC, p);

function walk(target: string): string[] {
  const full = path.resolve(SRC, target);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [full];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(full, e.name);
    return e.isDirectory() ? walk(rel(p)) : [p];
  });
}

const isSource = (f: string) => /\.(ts|tsx)$/.test(f) && !/\.test\.(ts|tsx)$/.test(f);

// Every non-test file that is part of the meetups feature.
const FEATURE_FILES = [
  ...walk("features/meetups"),
  ...walk("app/api/meetups"),
  ...walk("app/api/school/meetups"),
  ...walk("app/api/school/meetup-locations"),
  ...walk("features/school/components/admin/tabs/MeetupsTab.tsx"),
].filter(isSource);

// What a school admin can reach. None of it may know the note exists.
const ADMIN_FILES = [
  ...walk("features/meetups/server/adminData.ts"),
  ...walk("features/meetups/server/adminGuard.ts"),
  ...walk("features/meetups/adminTypes.ts"),
  ...walk("features/meetups/locationRules.ts"),
  ...walk("app/api/school/meetups"),
  ...walk("app/api/school/meetup-locations"),
  ...walk("features/school/components/admin/tabs/MeetupsTab.tsx"),
].filter(isSource);

const read = (f: string) => fs.readFileSync(f, "utf8");

// Comments may talk about the note (they document the guarantee). Only code counts.
const code = (f: string) =>
  read(f)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("the guard test sees the feature", () => {
  it("found the files it is meant to audit", () => {
    expect(FEATURE_FILES.length).toBeGreaterThan(15);
    expect(ADMIN_FILES.length).toBeGreaterThanOrEqual(6);
    expect(FEATURE_FILES.map(rel)).toContain("features/meetups/server/notify.ts");
    expect(ADMIN_FILES.map(rel)).toContain("features/meetups/server/adminData.ts");
  });
});

describe("the note never reaches an admin surface", () => {
  it.each(ADMIN_FILES.map((f) => [rel(f), f]))("%s does not mention the note", (_name, file) => {
    expect(code(file as string)).not.toMatch(/\bnote(s|Text|Label)?\b/i);
  });

  it("admin queries never select the email-claim columns", () => {
    expect(code(path.join(SRC, "features/meetups/server/adminData.ts"))).not.toMatch(/email_sent_at/);
  });
});

describe("logging", () => {
  // Fixed labels, a Postgres error code, or an email variant/reason. Never an
  // error object (it can echo the failing row, note included), never a name,
  // an address or the note.
  const ALLOWED = [
    /^console\.(error|warn)\("[^"$]*"\);?$/, // fixed string
    /^console\.(error|warn)\("[^"$]*", error\.code\);?$/, // string + Postgres code
    /^console\.(error|warn)\(`\[meetup-email\] \$\{planned\.variant\}[^`$]*`\);?$/, // variant label
    /^console\.(error|warn)\(`\[meetup-email\] \$\{planned\.variant\} not sent \(\$\{result\.reason\}\)`\);?$/,
  ];

  const calls = FEATURE_FILES.flatMap((file) =>
    read(file)
      .split("\n")
      .map((line, i) => ({ file: rel(file), line: i + 1, text: line.trim() }))
      .filter((l) => /console\.(log|info|debug|warn|error)\(/.test(l.text)),
  );

  it("finds the console calls it is meant to audit", () => {
    expect(calls.length).toBeGreaterThan(10);
  });

  it("uses no console.log, info or debug at all", () => {
    expect(calls.filter((c) => /console\.(log|info|debug)\(/.test(c.text))).toEqual([]);
  });

  it.each(calls.map((c) => [`${c.file}:${c.line}`, c.text]))("%s logs only safe text", (_where, text) => {
    expect(ALLOWED.some((re) => re.test(text as string))).toBe(true);
  });
});

describe("no analytics or error reporting on student meetup data", () => {
  it.each(FEATURE_FILES.map((f) => [rel(f), f]))("%s has none", (_name, file) => {
    expect(code(file as string)).not.toMatch(
      /posthog|trackEvent|captureException|sentry|@vercel\/analytics|\bgtag\b|mixpanel|segment/i,
    );
  });
});

describe("one door to the tables", () => {
  it("only the two data files query meetups or meetup_locations", () => {
    const offenders = walk(".")
      .filter(isSource)
      .filter((f) => /from\(\s*["'](meetups|meetup_locations)["']\s*\)/.test(read(f)))
      .map(rel)
      .sort();
    expect(offenders).toEqual([
      "features/meetups/server/adminData.ts",
      "features/meetups/server/data.ts",
    ]);
  });
});
