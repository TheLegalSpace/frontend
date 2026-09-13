// app/utils/captcha.ts
//
// Optional reCAPTCHA v3 support for POST /auth/register/start.
//
// The backend calls `verifyCaptcha(captchaToken)` only while CAPTCHA_ENABLED is
// true. This helper returns `undefined` when no site key is configured (the
// local/preview path), so the token is simply omitted and the request is sent
// as before — no behaviour change when captcha is off.

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
const ACTION = "professional_signup";
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
 * Never throws: a captcha hiccup must not block signup — if a token was truly
 * required the backend returns a clear, user-safe message.
 */
export async function getRecaptchaToken(): Promise<string | undefined> {
  if (!SITE_KEY) return undefined;
  try {
    await loadScript();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return undefined;
    return await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(SITE_KEY, { action: ACTION })
          .then(resolve)
          .catch(reject);
      });
    });
  } catch {
    return undefined;
  }
}
