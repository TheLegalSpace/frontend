import Link from "next/link";
import { ReactNode } from "react";

export function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-medium text-white px-3 py-2 rounded-[4px] mb-4"
      style={{ background: "#1A56DB" }}
    >
      {children}
    </span>
  );
}

export function BackArrow({ href }: { href: string }) {
    return (
      <Link
        href={href}
        aria-label="Back to services"
        className="text-gray-400 hover:text-gray-600 transition inline-flex items-center justify-center w-7 h-7 -ml-1"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
    );
  }

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[12px] text-gray-500 mb-1.5">{children}</label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
        props.className ?? ""
      }`}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none ${
        props.className ?? ""
      }`}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }
) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white appearance-none ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </select>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

export function Divider() {
  return <div className="border-t border-gray-100 my-6" />;
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {label}
    </label>
  );
}

export function RadioOption({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer select-none">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {label}
    </label>
  );
}

export function SubmitButton({
  children,
  loading,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-md text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
      style={{ background: "#1A56DB" }}
    >
      {loading ? "Submitting…" : children}
      {!loading && <span className="text-base leading-none">→</span>}
    </button>
  );
}

export function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-[12px] text-red-600 -mt-2">{message}</p>;
}

export function SuccessState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-20 px-6">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "#eff6ff" }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1A56DB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2
        className="text-[20px] text-gray-900"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {title}
      </h2>
      <p className="text-[13px] text-gray-500 max-w-sm">{message}</p>
      <Link
        href="/dashboard/TLS-Services"
        className="mt-2 text-[13px] font-medium px-4 py-2.5 rounded-xl text-white"
        style={{ background: "#1A56DB" }}
      >
        Back to TLS Services
      </Link>
    </div>
  );
}