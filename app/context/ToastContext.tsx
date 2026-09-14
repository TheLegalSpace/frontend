// context/ToastContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { CheckCircle, X, AlertCircle } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
  visible: boolean; // ✅ controls enter/exit animation
}

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const isSuccess = toast.type === "success";

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl border text-[13px] font-medium min-w-70 max-w-sm overflow-hidden transition-all duration-500 ease-out ${
        toast.visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-3 scale-95"
      } ${
        isSuccess
          ? "bg-white border-green-100"
          : "bg-white border-red-100"
      }`}
    >
      {/* ✅ Left color bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
          isSuccess ? "bg-green-500" : "bg-red-500"
        }`}
      />

      {/* Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isSuccess ? "bg-green-50" : "bg-red-50"
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className={`text-[12px] font-semibold mb-0.5 ${isSuccess ? "text-green-700" : "text-red-600"}`}>
          {isSuccess ? "Success" : "Error"}
        </p>
        <p className="text-[12px] text-gray-500 leading-relaxed font-normal">
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mt-0.5"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>

      {/* ✅ Progress bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
          isSuccess ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <div
          className={`h-full rounded-full ${
            isSuccess ? "bg-green-400" : "bg-red-400"
          } ${toast.visible ? "animate-toast-progress" : ""}`}
        />
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    // ✅ Trigger exit animation first
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    // Then remove from DOM after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 500);
  }, []);

  const addToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // ✅ Add with visible: false first (for enter animation)
      setToasts((prev) => [...prev, { id, message, type, visible: false }]);

      // Trigger enter animation on next tick
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
        );
      }, 10);

      // Auto dismiss after 3.5s
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  const showSuccess = useCallback(
    (message: string) => addToast(message, "success"),
    [addToast]
  );

  const showError = useCallback(
    (message: string) => addToast(message, "error"),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-5 right-5 z-9999 flex flex-col gap-2.5 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onDismiss={dismiss} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};