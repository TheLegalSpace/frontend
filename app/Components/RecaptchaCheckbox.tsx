// app/Components/RecaptchaCheckbox.tsx
"use client";

import { useEffect, useRef } from "react";
import {
  CHECKBOX_ENABLED,
  RECAPTCHA_SITE_KEY,
  destroyCheckbox,
  renderCheckbox,
} from "@/lib/captcha/widget";

interface RecaptchaCheckboxProps {
  /** Called with the response token once the user completes the widget. */
  onToken: (token: string) => void;
  /** The token expired (~2 min). The caller must clear its stored token. */
  onExpired?: () => void;
  /** Google couldn't render or verify the widget. */
  onError?: () => void;
  theme?: "light" | "dark";
}

/**
 * The real reCAPTCHA Enterprise checkbox. Renders nothing when no site key is
 * configured, so callers that want a dev fallback should test CHECKBOX_ENABLED
 * themselves — see WaitlistPlaceholder.
 *
 * The widget owns its own DOM, so callbacks are held in a ref: re-rendering the
 * parent (e.g. every keystroke in the form) must not tear down and redraw the
 * widget, which would discard a solved challenge.
 */
export default function RecaptchaCheckbox({
  onToken,
  onExpired,
  onError,
  theme = "light",
}: RecaptchaCheckboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Keep the latest callbacks without re-running the render effect. Assigned in
  // an effect rather than during render, so a parent re-render — which happens on
  // every keystroke in the form — can't redraw the widget and discard a solved
  // challenge.
  const callbacksRef = useRef({ onToken, onExpired, onError });

  useEffect(() => {
    callbacksRef.current = { onToken, onExpired, onError };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!CHECKBOX_ENABLED || !container) return;

    let cancelled = false;

    renderCheckbox(container, {
      sitekey: RECAPTCHA_SITE_KEY,
      theme,
      callback: (token) => callbacksRef.current.onToken(token),
      "expired-callback": () => callbacksRef.current.onExpired?.(),
      "error-callback": () => callbacksRef.current.onError?.(),
    })
      .then((widgetId) => {
        // Unmounted before the widget finished drawing — undo it.
        if (cancelled) {
          destroyCheckbox(container, widgetId);
          return;
        }
        widgetIdRef.current = widgetId;
      })
      .catch(() => {
        if (!cancelled) callbacksRef.current.onError?.();
      });

    return () => {
      cancelled = true;
      destroyCheckbox(container, widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [theme]);

  if (!CHECKBOX_ENABLED) return null;

  // min-height reserves the widget's footprint so the form doesn't jump when it
  // finishes drawing.
  return <div ref={containerRef} className="min-h-[78px]" />;
}
