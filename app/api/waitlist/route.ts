// app/api/waitlist/route.ts
//
// Server-side waitlist collection for the /frontend project (no backend
// dependency). Signups are persisted to Netlify Blobs when running on Netlify
// (the serverless filesystem is read-only, so `fs` fails with a 500 there),
// and to a local CSV file under ./data for local `npm run dev`.
// A GET to this route streams the full spreadsheet back as a downloadable file.
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getStore } from "@netlify/blobs";

// Node runtime so we can use the filesystem fallback locally.
export const runtime = "nodejs";

export type WaitlistVariant = "lawyer" | "user";

interface WaitlistPayload {
  fullName?: string;
  email?: string;
  variant?: WaitlistVariant;
}

interface WaitlistEntry {
  fullName: string;
  email: string;
  type: WaitlistVariant;
  createdAt: string;
}

// Netlify sets NETLIFY=true on its build/function runtime; locally it is unset.
const IS_NETLIFY = process.env.NETLIFY === "true";

const STORE_NAME = "waitlist";
const BLOB_KEY = "waitlist.csv";

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "waitlist.csv");

const CSV_HEADERS: (keyof WaitlistEntry)[] = [
  "fullName",
  "email",
  "type",
  "createdAt",
];

// Escape a single CSV cell per RFC 4180 (quotes doubled, wrap in quotes when
// the value contains a comma, quote, or newline).
function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function emailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toCsvRow(entry: WaitlistEntry): string {
  return CSV_HEADERS.map((h) => csvCell(String(entry[h]))).join(",");
}

// ── Netlify Blobs storage ─────────────────────────────────────────────────────
// Blobs are persistent across function invocations and survive cold starts.
async function readBlobCsv(): Promise<string> {
  const store = getStore(STORE_NAME);
  const raw = await store.get(BLOB_KEY, { type: "text" });
  return raw ?? "";
}

async function appendBlobCsv(row: string): Promise<void> {
  const store = getStore(STORE_NAME);
  const existing = await readBlobCsv();
  const next = existing.endsWith("\n") ? existing : `${existing}\n`;
  await store.set(BLOB_KEY, `${next}${row}\n`);
}

async function blobHasEmail(email: string): Promise<boolean> {
  const raw = await readBlobCsv();
  return raw
    .split("\n")
    .slice(1)
    .some((line) => {
      const cols = line.split(",");
      return cols[1]?.trim().toLowerCase() === email;
    });
}

// ── Local filesystem storage (fallback for `npm run dev`) ────────────────────
async function ensureLocalSpreadsheet(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(CSV_PATH);
  } catch {
    await fs.writeFile(CSV_PATH, `${CSV_HEADERS.join(",")}\n`, "utf8");
  }
}

async function readLocalCsv(): Promise<string> {
  await ensureLocalSpreadsheet();
  return fs.readFile(CSV_PATH, "utf8");
}

async function appendLocalCsv(row: string): Promise<void> {
  await ensureLocalSpreadsheet();
  await fs.appendFile(CSV_PATH, `${row}\n`, "utf8");
}

async function localHasEmail(email: string): Promise<boolean> {
  const raw = await readLocalCsv();
  return raw
    .split("\n")
    .slice(1)
    .some((line) => {
      const cols = line.split(",");
      return cols[1]?.trim().toLowerCase() === email;
    });
}

// ── Storage adapter ───────────────────────────────────────────────────────────
const readCsv = () => (IS_NETLIFY ? readBlobCsv() : readLocalCsv());
const appendCsv = (row: string) =>
  IS_NETLIFY ? appendBlobCsv(row) : appendLocalCsv(row);
const hasEmail = (email: string) =>
  IS_NETLIFY ? blobHasEmail(email) : localHasEmail(email);

export async function POST(request: NextRequest) {
  let body: WaitlistPayload;
  try {
    body = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const type: WaitlistVariant = body.variant === "user" ? "user" : "lawyer";

  if (!fullName || !emailValid(email)) {
    return NextResponse.json(
      { error: "Please provide a valid full name and email." },
      { status: 400 },
    );
  }

  try {
    if (await hasEmail(email)) {
      return NextResponse.json(
        { message: "You're already on the waitlist.", duplicate: true },
        { status: 200 },
      );
    }

    const row = toCsvRow({
      fullName,
      email,
      type,
      createdAt: new Date().toISOString(),
    });
    await appendCsv(row);

    return NextResponse.json(
      { message: "You're on the waitlist!", success: true },
      { status: 201 },
    );
  } catch (err) {
    console.error("[waitlist] failed to save signup:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your signup. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const content = await readCsv();

    // Stream the spreadsheet back as a downloadable CSV file.
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="waitlist-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("[waitlist] failed to read spreadsheet:", err);
    return NextResponse.json(
      { error: "Failed to load the waitlist spreadsheet." },
      { status: 500 },
    );
  }
}
