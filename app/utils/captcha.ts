// app/utils/captcha.ts
//
// CLIENT-ONLY reCAPTCHA v3 token minting for browser forms — professional signup
// and the waitlist. This module runs in the browser, so it reads only
// NEXT_PUBLIC_* values; the matching secret, score and action checks live
// server-side in lib/captcha/server.ts and must never be referenced here.
//
// Each caller passes a distinct `action` so a token minted for one form can't be
// replayed against another. The helper returns `undefined` when no site key is
// present (the local/preview path), so the token is simply omitted and the
// request is sent as before — no behaviour change when captcha is off.
import { CAPTCHA_ACTIONS } from "@/lib/captcha/actions";

// Re-exported so callers can keep importing the action names from this module.
export { CAPTCHA_ACTIONS };
export type { CaptchaAction } from "@/lib/captcha/actions";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = "recaptcha-v3";
const DEFAULT_ACTION = CAPTCHA_ACTIONS.professionalSignup;
const LOAD_TIMEOUT_MS = 10_000;

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("captcha: no window"));
      return;
    }
    if (window.grecaptcha) {
      resolve();
      return;
    }
    // Script already injected (e.g. by a previous attempt) — wait for it.
    if (document.getElementById(SCRIPT_ID)) {
      const startedAt = Date.now();
      const iv = window.setInterval(() => {
        if (window.grecaptcha) {
          window.clearInterval(iv);
          resolve();
        } else if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
          window.clearInterval(iv);
          reject(new Error("captcha: load timeout"));
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("captcha: load failed"));
    document.head.appendChild(script);
  });
}

/**
 * Returns a reCAPTCHA token when captcha is configured, otherwise `undefined`.
 * Never throws: a captcha hiccup must not block the form — if a token was truly
 * required the server returns a clear, user-safe message.
 *
 * @param action Endpoint-specific action, e.g. `CAPTCHA_ACTIONS.waitlistSignup`.
 *               Defaults to the professional-signup action for backward compat.
 */
export async function getRecaptchaToken(
  action: string = DEFAULT_ACTION,
): Promise<string | undefined> {
  if (!SITE_KEY) return undefined;
  try {
    await loadScript();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return undefined;
    return await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(reject);
      });
    });
  } catch {
    return undefined;
  }
}
