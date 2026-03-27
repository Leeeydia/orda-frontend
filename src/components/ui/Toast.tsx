import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-lg backdrop-blur-md ${
        type === "success"
          ? "border-[#89943d]/30 bg-[#f7f7f6]/90 text-[#4a521e]"
          : "border-red-200 bg-white/90 text-red-600"
      }`}>
      <span className="text-base" aria-hidden="true">
        {type === "success" ? "✓" : "✕"}
      </span>
      <span className="flex-1 text-sm leading-snug font-medium text-slate-700">
        {message}
      </span>
      <button
        onClick={onClose}
        aria-label="닫기"
        className="text-lg leading-none text-slate-400 transition active:opacity-60">
        ×
      </button>
    </div>
  );
}
