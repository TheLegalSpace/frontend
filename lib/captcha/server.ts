// lib/captcha/server.ts
//
// SERVER-ONLY reCAPTCHA Enterprise verification via the assessments API
// (projects.assessments.create), matching the Google Cloud sample.
//
// This module holds credentials and the service-account key (directly or by
// reference). It must never be imported from a file that carries "use client",
// or those references get pulled toward the browser bundle. Client-side token
// minting lives in app/utils/captcha.ts.
//
// Unlike the legacy siteverify endpoint, there is no shared secret here. The
// token is exchanged for an assessment using a Google Cloud credential that has
// the "reCAPTCHA Enterprise Agent" role on the project; `tokenProperties.valid`
// and `riskAnalysis.score` come back in the response.
//
// Failure policy: fail CLOSED.
//   - Incomplete env (site key and/or project id missing, or a bad
//     RECAPTCHA_MIN_SCORE) raises CaptchaError("config") rather than skipping.
//   - A failed assessment call raises CaptchaError("unavailable"), or "config"
//     when the error is really a permissions/project problem.
//
// The only non-error path is captcha being deliberately off: no env at all and
// no CAPTCHA_ENABLED flag.
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { CAPTCHA_ACTIONS, type CaptchaAction } from "./actions";

// Guard against the one mistake this file exists to prevent.
if (typeof window !== "undefined") {
  throw new Error(
    "lib/captcha/server.ts is server-only — import app/utils/captcha.ts in the browser.",
  );
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID ?? "";
const CAPTCHA_FLAG = process.env.CAPTCHA_ENABLED;

// Dedicated reCAPTCHA credentials take precedence; otherwise reuse the Google
// service account already configured for Sheets (same GCP project). If neither is
// set we pass nothing and let the SDK fall back to Application Default
// Credentials, which is the right thing on GCP-hosted runtimes.
const CLIENT_EMAIL =
  process.env.RECAPTCHA_CLIENT_EMAIL ||
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
  "";
const PRIVATE_KEY = (
  process.env.RECAPTCHA_PRIVATE_KEY ||
  process.env.GOOGLE_PRIVATE_KEY ||
  ""
).replace(/\\n/g, "\n");

// Validated rather than blindly Number()'d: `Number("0.5.")` is NaN, and a NaN
// threshold makes `score < NaN` always false — so a typo here would silently
// disable score rejection while looking configured.
const RAW_MIN_SCORE = process.env.RECAPTCHA_MIN_SCORE;
const PARSED_MIN_SCORE =
  RAW_MIN_SCORE === undefined ? 0.5 : Number(RAW_MIN_SCORE);
const MIN_SCORE_VALID =
  Number.isFinite(PARSED_MIN_SCORE) &&
  PARSED_MIN_SCORE >= 0 &&
  PARSED_MIN_SCORE <= 1;
const RECAPTCHA_MIN_SCORE = MIN_SCORE_VALID ? PARSED_MIN_SCORE : 0.5;

const HAS_SITE_KEY = Boolean(SITE_KEY);
const HAS_PROJECT = Boolean(PROJECT_ID);
const HAS_CREDENTIALS = Boolean(CLIENT_EMAIL && PRIVATE_KEY);

// Explicit CAPTCHA_ENABLED wins; otherwise verification turns on by itself once
// the site key and project are both present.
const CAPTCHA_ENFORCED =
  CAPTCHA_FLAG !== undefined
    ? CAPTCHA_FLAG === "true"
    : HAS_SITE_KEY && HAS_PROJECT;

// Reused across invocations — the SDK client is expensive to construct and its
// own docs recommend caching it.
let assessmentClient: RecaptchaEnterpriseServiceClient | null = null;

function getClient(): RecaptchaEnterpriseServiceClient {
  if (!assessmentClient) {
    assessmentClient = new RecaptchaEnterpriseServiceClient({
      projectId: PROJECT_ID,
      ...(HAS_CREDENTIALS
        ? {
            credentials: {
              client_email: CLIENT_EMAIL,
              private_key: PRIVATE_KEY,
            },
          }
        : {}),
    });
  }
  return assessmentClient;
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
  if (!forcedOn && !HAS_SITE_KEY && !HAS_PROJECT) return;

  const problems: string[] = [];
  if (!HAS_SITE_KEY) problems.push("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing");
  if (!HAS_PROJECT) problems.push("RECAPTCHA_PROJECT_ID is missing");
  if (RAW_MIN_SCORE !== undefined && !MIN_SCORE_VALID) {
    problems.push(
      `RECAPTCHA_MIN_SCORE must be a number between 0 and 1 (got "${RAW_MIN_SCORE}")`,
    );
  }
  if (problems.length === 0) return;

  throw new CaptchaError(
    `reCAPTCHA is misconfigured — ${problems.join("; ")}. ` +
      `Set the site key and project id, or unset both to disable captcha. ` +
      `(siteKey=${HAS_SITE_KEY ? "set" : "missing"}, ` +
      `project=${HAS_PROJECT ? "set" : "missing"}, ` +
      `credentials=${HAS_CREDENTIALS ? "explicit" : "application-default"}, ` +
      `CAPTCHA_ENABLED=${CAPTCHA_FLAG ?? "unset"})`,
    "config",
  );
}

export type CaptchaVerification =
  | { ok: true; score?: number }
  | {
      ok: false;
      reason: "missing" | "failed" | "low_score" | "action_mismatch";
    };

// Errors that mean "this deployment is wrong", not "try again later".
const CONFIG_ERROR_PATTERN =
  /PERMISSION_DENIED|NOT_FOUND|CONSUMER_INVALID|INVALID_ARGUMENT|has not been used in project|is disabled|API is not enabled/i;

function isConfigError(message: string): boolean {
  return CONFIG_ERROR_PATTERN.test(message);
}

/**
 * Verify a reCAPTCHA Enterprise token by creating an assessment.
 *
 * Throws CaptchaError("config") when the env (or IAM) is wrong, and
 * CaptchaError("unavailable") when Google can't be reached. This endpoint fails
 * closed.
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

  let response;
  try {
    const client = getClient();
    [response] = await client.createAssessment({
      parent: client.projectPath(PROJECT_ID),
      assessment: {
        event: {
          token,
          siteKey: SITE_KEY,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new CaptchaError(
      `reCAPTCHA assessment failed: ${message}`,
      isConfigError(message) ? "config" : "unavailable",
    );
  }

  const tokenProperties = response.tokenProperties;
  if (!tokenProperties?.valid) {
    // invalidReason is the useful bit: EXPIRED, DUPLICATE, MALFORMED, ...
    console.warn("[captcha] rejected token", tokenProperties?.invalidReason);
    return { ok: false, reason: "failed" };
  }

  // A token minted for another form (e.g. signup) must not be replayable here.
  const action = tokenProperties.action ?? "";
  if (action && action !== expectedAction) {
    console.warn(
      "[captcha] action mismatch",
      action,
      "expected",
      expectedAction,
    );
    return { ok: false, reason: "action_mismatch" };
  }

  const score = response.riskAnalysis?.score;
  if (typeof score === "number" && score < RECAPTCHA_MIN_SCORE) {
    const reasons = response.riskAnalysis?.reasons ?? [];
    console.warn("[captcha] score below threshold", score, reasons);
    return { ok: false, reason: "low_score" };
  }

  return { ok: true, score: typeof score === "number" ? score : undefined };
}
