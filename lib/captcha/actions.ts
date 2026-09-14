// lib/captcha/actions.ts
//
// Isomorphic reCAPTCHA v3 action names — no env access and no browser globals,
// so this is safe to import from both client code (app/utils/captcha.ts) and
// server code (lib/captcha/server.ts).
//
// Each form uses a distinct action so a token minted for one cannot be replayed
// against another. Both this app's verifier and the backend captcha service
// (backend/src/services/captcha.ts) check the action that comes back.
export const CAPTCHA_ACTIONS = {
  professionalSignup: "professional_signup",
  waitlistSignup: "waitlist_signup",
} as const;

export type CaptchaAction =
  (typeof CAPTCHA_ACTIONS)[keyof typeof CAPTCHA_ACTIONS];
