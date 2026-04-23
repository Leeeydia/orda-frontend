import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const toneClassMap: Record<ToastType, { container: string; icon: string }> = {
  success: {
    container: "border-success/30 bg-white text-body",
    icon: "text-success"
  },
  error: {
    container: "border-error/30 bg-white text-body",
    icon: "text-error"
  },
  warning: {
    container: "border-warning/40 bg-white text-body",
    icon: "text-warning"
  },
  info: {
    container: "border-info/30 bg-white text-body",
    icon: "text-info"
  }
};

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  const tone = toneClassMap[type];

  return (
    <div className="fixed bottom-6 left-1/2 z-[300] w-full max-w-[390px] -translate-x-1/2 px-4">
      <div
        role="alert"
        aria-live="assertive"
        className={`flex items-center gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur ${tone.container}`}>
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center ${tone.icon}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <line x1="12" y1="16.5" x2="12" y2="16.5" />
          </svg>
        </span>

        <span className="text-body flex-1 text-sm leading-5">{message}</span>

        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="text-muted hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-full transition-opacity duration-200 active:opacity-60">
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
