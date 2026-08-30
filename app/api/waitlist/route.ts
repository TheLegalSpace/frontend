// app/api/waitlist/route.ts
//
// Server-side waitlist collection for the /frontend project (no backend
// dependency). Each signup is appended to a CSV spreadsheet on the server:
//   frontend/data/waitlist.csv
// A GET to this route streams the full spreadsheet back as a downloadable file.
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Node runtime so we can use the filesystem to persist the spreadsheet.
export const runtime = "nodejs";

export type WaitlistVariant = "lawyer" | "user";

interface WaitlistPayload {
  fullName?: string;
  email?: string;
  variant?: WaitlistVariant;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "waitlist.csv");

const CSV_HEADERS = ["fullName", "email", "type", "createdAt"];

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

async function ensureSpreadsheet(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(CSV_PATH);
  } catch {
    await fs.writeFile(CSV_PATH, `${CSV_HEADERS.join(",")}\n`, "utf8");
  }
}

async function readExistingEmails(): Promise<Set<string>> {
  try {
    const raw = await fs.readFile(CSV_PATH, "utf8");
    const lines = raw.split("\n").slice(1);
    const emails = new Set<string>();
    for (const line of lines) {
      if (!line.trim()) continue;
      // Columns are simple (no embedded newlines), so a naive split is fine.
      const email = line.split(",")[1]?.trim().toLowerCase();
      if (email) emails.add(email);
    }
    return emails;
  } catch {
    return new Set();
  }
}

export async function POST(request: NextRequest) {
  let body: WaitlistPayload;
  try {
    body = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const variant: WaitlistVariant = body.variant === "user" ? "user" : "lawyer";

  if (!fullName || !emailValid(email)) {
    return NextResponse.json(
      { error: "Please provide a valid full name and email." },
      { status: 400 },
    );
  }

  await ensureSpreadsheet();

  const existing = await readExistingEmails();
  if (existing.has(email)) {
    return NextResponse.json(
      { message: "You're already on the waitlist.", duplicate: true },
      { status: 200 },
    );
  }

  const row = [fullName, email, variant, new Date().toISOString()]
    .map(csvCell)
    .join(",");

  await fs.appendFile(CSV_PATH, `${row}\n`, "utf8");

  return NextResponse.json(
    { message: "You're on the waitlist!", success: true },
    { status: 201 },
  );
}

export async function GET() {
  await ensureSpreadsheet();

  const content = await fs.readFile(CSV_PATH, "utf8");

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
}
