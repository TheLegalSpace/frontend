// app/api/waitlist/route.ts
//
// Server-side waitlist collection for the /frontend project (no backend
// dependency). Signups are appended to a Google Spreadsheet via a service
// account. If the Google env vars aren't configured yet, it falls back to
// Netlify Blobs (on Netlify) or a local CSV under ./data (for `npm run dev`).
// A GET to this route streams the full spreadsheet back as a downloadable file.
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getStore } from "@netlify/blobs";
import { google, sheets_v4 } from "googleapis";

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

const CSV_HEADERS: (keyof WaitlistEntry)[] = [
  "fullName",
  "email",
  "type",
  "createdAt",
];

// ── Config ────────────────────────────────────────────────────────────────────
// Set these in Netlify (or .env locally):
//   GOOGLE_SHEET_ID             – the id from your spreadsheet URL
//   GOOGLE_SERVICE_ACCOUNT_EMAIL – client_email from the service account JSON
//   GOOGLE_PRIVATE_KEY          – private_key from the service account JSON
//   GOOGLE_SHEET_NAME           – optional, defaults to "Sheet1"
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const GOOGLE_SERVICE_ACCOUNT_EMAIL =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n",
);
const GOOGLE_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Sheet1";

const GOOGLE_CONFIGURED = Boolean(
  GOOGLE_SHEET_ID && GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY,
);

// Netlify sets NETLIFY=true on its build/function runtime; locally it is unset.
const IS_NETLIFY = process.env.NETLIFY === "true";

const STORE_NAME = "waitlist";
const BLOB_KEY = "waitlist.csv";

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "waitlist.csv");

// ── Google Sheets storage ─────────────────────────────────────────────────────
let sheetsClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
  if (!sheetsClient) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

async function appendGoogleRow(entry: WaitlistEntry): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${GOOGLE_SHEET_NAME}!A:D`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[entry.fullName, entry.email, entry.type, entry.createdAt]],
    },
  });
}

async function googleRows(): Promise<WaitlistEntry[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${GOOGLE_SHEET_NAME}!A:D`,
  });
  const values = res.data.values ?? [];
  // First row is the header – skip it.
  return values
    .slice(1)
    .map(
      (row): WaitlistEntry => ({
        fullName: String(row[0] ?? ""),
        email: String(row[1] ?? "").toLowerCase(),
        type: String(row[2] ?? "") === "user" ? "user" : "lawyer",
        createdAt: String(row[3] ?? ""),
      }),
    )
    .filter((r) => r.email);
}

// ── Netlify Blobs storage (fallback when Google isn't configured) ─────────────
async function readBlobCsv(): Promise<string> {
  const store = getStore(STORE_NAME);
  return (await store.get(BLOB_KEY, { type: "text" })) ?? "";
}

async function appendBlobCsv(row: string): Promise<void> {
  const store = getStore(STORE_NAME);
  const existing = await readBlobCsv();
  const next = existing.endsWith("\n") ? existing : `${existing}\n`;
  await store.set(BLOB_KEY, `${next}${row}\n`);
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function entriesToCsv(entries: WaitlistEntry[]): string {
  return [CSV_HEADERS.join(","), ...entries.map(toCsvRow)].join("\n") + "\n";
}

function emailsFromCsv(raw: string): Set<string> {
  const emails = new Set<string>();
  for (const line of raw.split("\n").slice(1)) {
    const email = line.split(",")[1]?.trim().toLowerCase();
    if (email) emails.add(email);
  }
  return emails;
}

// Returned when this deployment has no working storage backend (e.g. Netlify
// Blobs is not configured on the deployed site). The Google Sheets env vars
// must be set on the host (Netlify → Site settings → Environment variables)
// for signups to persist.
function storageNotConfiguredResponse() {
  return NextResponse.json(
    {
      error:
        "Waitlist storage isn't configured on this deployment. Add the Google Sheets env vars (GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) to Netlify and redeploy.",
    },
    { status: 503 },
  );
}

async function fallbackEntries(): Promise<WaitlistEntry[]> {
  if (IS_NETLIFY) {
    const raw = await readBlobCsv();
    const emails = emailsFromCsv(raw);
    return [...emails].map((email) => ({
      fullName: "",
      email,
      type: "lawyer" as WaitlistVariant,
      createdAt: "",
    }));
  }
  const raw = await readLocalCsv();
  return raw
    .split("\n")
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const cols = line.split(",");
      return {
        fullName: cols[0] ?? "",
        email: (cols[1] ?? "").toLowerCase(),
        type: cols[2] === "user" ? "user" : "lawyer",
        createdAt: cols[3] ?? "",
      };
    });
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
  const type: WaitlistVariant = body.variant === "user" ? "user" : "lawyer";

  if (!fullName || !emailValid(email)) {
    return NextResponse.json(
      { error: "Please provide a valid full name and email." },
      { status: 400 },
    );
  }

  try {
    if (GOOGLE_CONFIGURED) {
      const existing = await googleRows();
      if (existing.some((r) => r.email === email)) {
        return NextResponse.json(
          { message: "You're already on the waitlist.", duplicate: true },
          { status: 200 },
        );
      }
      await appendGoogleRow({
        fullName,
        email,
        type,
        createdAt: new Date().toISOString(),
      });
    } else if (IS_NETLIFY) {
      // Netlify Blobs throws "The environment has not been configured to use
      // Netlify Blobs" when the deploy isn't set up for it. Surface that as a
      // clear 503 instead of a generic 500 so the misconfiguration is obvious.
      let raw: string;
      try {
        raw = await readBlobCsv();
      } catch (blobErr) {
        console.error("[waitlist] Netlify Blobs unavailable:", blobErr);
        return storageNotConfiguredResponse();
      }
      if (emailsFromCsv(raw).has(email)) {
        return NextResponse.json(
          { message: "You're already on the waitlist.", duplicate: true },
          { status: 200 },
        );
      }
      try {
        await appendBlobCsv(
          toCsvRow({
            fullName,
            email,
            type,
            createdAt: new Date().toISOString(),
          }),
        );
      } catch (blobErr) {
        console.error("[waitlist] Netlify Blobs write failed:", blobErr);
        return storageNotConfiguredResponse();
      }
    } else {
      const raw = await readLocalCsv();
      if (emailsFromCsv(raw).has(email)) {
        return NextResponse.json(
          { message: "You're already on the waitlist.", duplicate: true },
          { status: 200 },
        );
      }
      await appendLocalCsv(
        toCsvRow({
          fullName,
          email,
          type,
          createdAt: new Date().toISOString(),
        }),
      );
    }

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
    let csv: string;
    if (GOOGLE_CONFIGURED) {
      csv = entriesToCsv(await googleRows());
    } else {
      try {
        csv = entriesToCsv(await fallbackEntries());
      } catch (err) {
        console.error("[waitlist] failed to read fallback store:", err);
        return storageNotConfiguredResponse();
      }
    }

    return new NextResponse(csv, {
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
