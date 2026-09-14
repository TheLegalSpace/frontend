// lib/captcha/widget.ts
//
// CLIENT-ONLY helpers for the reCAPTCHA Enterprise *checkbox* widget.
//
// A checkbox key issues its token from the widget's callback once the user ticks
// the box — escalating to an image challenge when Google decides it needs to. It
// is NOT produced by grecaptcha.enterprise.execute(), which is the score-based
// (invisible) flow in app/utils/captcha.ts. Hence this module loads
// enterprise.js with ?render=explicit and renders into a container the caller
// supplies.
//
// Do not load this and the invisible path on the same page: both guard on the
// same script id, and whichever loads first decides which grecaptcha surface
// exists. The waitlist uses this; the professional-signup flow uses that one.
export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

/** Whether a checkbox widget can be rendered — i.e. a site key is configured. */
export const CHECKBOX_ENABLED = Boolean(RECAPTCHA_SITE_KEY);

const SCRIPT_ID = "recaptcha-enterprise";
const LOAD_TIMEOUT_MS = 10_000;

export interface CheckboxRenderParams {
  sitekey: string;
  theme?: "light" | "dark";
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface EnterpriseApi {
  ready: (cb: () => void) => void;
  render: (container: HTMLElement, params: CheckboxRenderParams) => number;
  reset: (widgetId?: number) => void;
}

function getEnterprise(): EnterpriseApi | null {
  const grecaptcha = (
    window as unknown as { grecaptcha?: { enterprise?: EnterpriseApi } }
  ).grecaptcha;
  return grecaptcha?.enterprise ?? null;
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("captcha: no window"));
      return;
    }
    if (getEnterprise()) {
      resolve();
      return;
    }
    // Script tag already present but the surface isn't ready yet — poll briefly.
    if (document.getElementById(SCRIPT_ID)) {
      const startedAt = Date.now();
      const iv = window.setInterval(() => {
        if (getEnterprise()) {
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
    // ?render=explicit is required for grecaptcha.enterprise.render(); the site
    // key is passed to render() instead of into the URL.
    script.src =
      "https://www.google.com/recaptcha/enterprise.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("captcha: load failed"));
    document.head.appendChild(script);
  });
}

/**
 * Render the checkbox into `container`, resolving with the widget id once Google
 * has drawn it. The token arrives later through `params.callback`, not here.
 */
export async function renderCheckbox(
  container: HTMLElement,
  params: CheckboxRenderParams,
): Promise<number> {
  await loadScript();

  const enterprise = getEnterprise();
  if (!enterprise) {
    throw new Error("captcha: grecaptcha.enterprise unavailable");
  }

  return new Promise<number>((resolve) => {
    enterprise.ready(() => resolve(enterprise.render(container, params)));
  });
}

/**
 * Tear a widget down. React doesn't own what the widget injects into the
 * container, so the markup is cleared explicitly — otherwise a remount would
 * try to render into a container Google still considers occupied.
 */
export function destroyCheckbox(
  container: HTMLElement,
  widgetId: number | null,
): void {
  if (widgetId !== null) {
    try {
      getEnterprise()?.reset(widgetId);
    } catch {
      // Widget already gone — nothing to reset.
    }
  }
  container.innerHTML = "";
}
