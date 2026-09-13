// lib/captcha/server.ts
//
// SERVER-ONLY reCAPTCHA v3 verification.
//
// This module reads RECAPTCHA_SECRET. It must never be imported from a file that
// carries "use client" — the secret must not be referenced (even as an unused
// binding) in code that gets bundled for the browser. Client-side token minting
// lives in app/utils/captcha.ts.
//
// Failure policy: fail CLOSED.
//   - Half-configured env (only one of site key / secret set, or
//     CAPTCHA_ENABLED=true with either missing) raises CaptchaError("config")
//     rather than silently skipping the check.
//   - A verify call that errors, returns a non-OK status, or returns non-JSON
//     raises CaptchaError("unavailable") rather than letting the signup through.
//
// The only non-error path is captcha being deliberately off: no keys at all and
// no CAPTCHA_ENABLED flag.
import { CAPTCHA_ACTIONS, type CaptchaAction } from "./actions";

// Guard against the one mistake this file exists to prevent.
if (typeof window !== "undefined") {
  throw new Error(
    "lib/captcha/server.ts is server-only — import app/utils/captcha.ts in the browser.",
  );
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET ?? "";
const CAPTCHA_FLAG = process.env.CAPTCHA_ENABLED;
const RECAPTCHA_VERIFY_URL =
  process.env.RECAPTCHA_VERIFY_URL ||
  "https://www.google.com/recaptcha/api/siteverify";
const RECAPTCHA_MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

const HAS_SITE_KEY = Boolean(SITE_KEY);
const HAS_SECRET = Boolean(RECAPTCHA_SECRET);

// Explicit CAPTCHA_ENABLED wins; otherwise verification turns on by itself once
// both keys are present.
const CAPTCHA_ENFORCED =
  CAPTCHA_FLAG !== undefined
    ? CAPTCHA_FLAG === "true"
    : HAS_SITE_KEY && HAS_SECRET;

interface SiteVerifyResponse {
  success?: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

/**
 * Raised for both misconfiguration and provider failures, so callers can map
 * them to distinct HTTP responses instead of guessing from a message string.
 */
export class CaptchaError extends Error {
  readonly code: "config" | "unavailable";

  constructor(message: string, code: "config" | "unavailable") {
    super(message);
    this.name = "CaptchaError";
    this.code = code;
  }
}

/**
 * Assert the reCAPTCHA env is coherent. Called on every verification, so a
 * deployment that only half-received its variables fails loudly rather than
 * quietly waving signups through.
 *
 * A deployment with no reCAPTCHA env at all is treated as deliberately off and
 * is not an error.
 */
export function assertCaptchaConfig(): void {
  const forcedOn = CAPTCHA_FLAG === "true";

  // Nothing configured and not forced on → captcha is intentionally disabled.
  if (!forcedOn && !HAS_SITE_KEY && !HAS_SECRET) return;

  const missing: string[] = [];
  if (!HAS_SITE_KEY) missing.push("NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
  if (!HAS_SECRET) missing.push("RECAPTCHA_SECRET");
  if (missing.length === 0) return;

  throw new CaptchaError(
    `reCAPTCHA is half-configured — missing ${missing.join(" and ")}. ` +
      `Set both keys, or unset both to disable captcha. ` +
      `(siteKey=${HAS_SITE_KEY ? "set" : "missing"}, ` +
      `secret=${HAS_SECRET ? "set" : "missing"}, ` +
      `CAPTCHA_ENABLED=${CAPTCHA_FLAG ?? "unset"})`,
    "config",
  );
}

export type CaptchaVerification =
  | { ok: true }
  | {
      ok: false;
      reason: "missing" | "failed" | "low_score" | "action_mismatch";
    };

/**
 * Verify a reCAPTCHA v3 token against Google's siteverify endpoint.
 *
 * Throws CaptchaError("config") when the env is incomplete, and
 * CaptchaError("unavailable") when Google can't be reached or answers with a
 * non-OK status. This endpoint fails closed.
 *
 * @param token          Token returned by getRecaptchaToken() in the browser.
 * @param expectedAction Action the token must have been minted for. A token from
 *                       another form is rejected so it can't be replayed here.
 */
export async function verifyRecaptchaToken(
  token: string | null | undefined,
  expectedAction: CaptchaAction = CAPTCHA_ACTIONS.waitlistSignup,
): Promise<CaptchaVerification> {
  assertCaptchaConfig();

  // Deliberately disabled (CAPTCHA_ENABLED=false, or no env at all).
  if (!CAPTCHA_ENFORCED) return { ok: true };

  if (!token) return { ok: false, reason: "missing" };

  let res: Response;
  try {
    const body = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: token,
    });
    res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    throw new CaptchaError(
      `reCAPTCHA verification request failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
      "unavailable",
    );
  }

  if (!res.ok) {
    throw new CaptchaError(
      `reCAPTCHA siteverify returned HTTP ${res.status}`,
      "unavailable",
    );
  }

  let data: SiteVerifyResponse;
  try {
    data = (await res.json()) as SiteVerifyResponse;
  } catch {
    throw new CaptchaError(
      "reCAPTCHA siteverify returned a non-JSON response",
      "unavailable",
    );
  }

  if (!data.success) {
    console.warn("[captcha] rejected", data["error-codes"]);
    return { ok: false, reason: "failed" };
  }
  if (typeof data.score === "number" && data.score < RECAPTCHA_MIN_SCORE) {
    console.warn("[captcha] score below threshold", data.score);
    return { ok: false, reason: "low_score" };
  }
  // A token minted for another form (e.g. signup) must not be replayable here.
  if (data.action && data.action !== expectedAction) {
    console.warn(
      "[captcha] action mismatch",
      data.action,
      "expected",
      expectedAction,
    );
    return { ok: false, reason: "action_mismatch" };
  }

  return { ok: true };
}
