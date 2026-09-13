// lib/captcha/server.ts
//
// SERVER-ONLY reCAPTCHA v3 verification.
//
// This module reads RECAPTCHA_SECRET. It must never be imported from a file that
// carries "use client" — the secret must not be referenced (even as an unused
// binding) in code that gets bundled for the browser. Client-side token minting
// lives in app/utils/captcha.ts.
//
// The waitlist lives entirely in this Next.js app, so its signups are verified
// here rather than in the backend. The policy mirrors backend/src/services/
// captcha.ts: a missing or failing token is a hard rejection, but a provider
// outage — or an enabled-but-secretless deployment — fails open with a loud log
// rather than taking the form down.
import { CAPTCHA_ACTIONS, type CaptchaAction } from "./actions";

// Guard against the one mistake this file exists to prevent.
if (typeof window !== "undefined") {
  throw new Error(
    "lib/captcha/server.ts is server-only — import app/utils/captcha.ts in the browser.",
  );
}

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET ?? "";
const RECAPTCHA_VERIFY_URL =
  process.env.RECAPTCHA_VERIFY_URL ||
  "https://www.google.com/recaptcha/api/siteverify";
const RECAPTCHA_MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

// Optional override. Defaults to "on once a secret is set", so a deploy that
// adds the secret is protected without also having to flip a flag.
const CAPTCHA_ENABLED =
  process.env.CAPTCHA_ENABLED !== undefined
    ? process.env.CAPTCHA_ENABLED === "true"
    : Boolean(RECAPTCHA_SECRET);

export type CaptchaVerification =
  | { ok: true }
  | {
      ok: false;
      reason: "missing" | "failed" | "low_score" | "action_mismatch";
    };

/**
 * Verify a reCAPTCHA v3 token against Google's siteverify endpoint.
 *
 * @param token          Token returned by getRecaptchaToken() in the browser.
 * @param expectedAction Action the token must have been minted for. A token from
 *                       another form is rejected so it can't be replayed here.
 */
export async function verifyRecaptchaToken(
  token: string | null | undefined,
  expectedAction: CaptchaAction = CAPTCHA_ACTIONS.waitlistSignup,
): Promise<CaptchaVerification> {
  if (!CAPTCHA_ENABLED) return { ok: true };

  if (!RECAPTCHA_SECRET) {
    console.error(
      "[captcha] CAPTCHA_ENABLED is on but RECAPTCHA_SECRET is unset — skipping",
    );
    return { ok: true };
  }

  if (!token) return { ok: false, reason: "missing" };

  try {
    const body = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: token,
    });
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

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
  } catch (err) {
    // Google unreachable. Blocking every signup because the provider is having a
    // bad minute is worse than the abuse the captcha prevents.
    console.error(
      "[captcha] verification call failed — allowing through:",
      err instanceof Error ? err.message : String(err),
    );
    return { ok: true };
  }
}
