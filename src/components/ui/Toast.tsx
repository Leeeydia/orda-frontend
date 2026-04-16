import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

const toneClassMap = {
  success: {
    container: "border-primary/20 bg-white text-body",
    icon: "text-primary"
  },
  error: {
    container: "border-error/30 bg-white text-body",
    icon: "text-error"
  }
} as const;

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
          className={`flex h-6 w-6 items-center justify-center text-base font-semibold ${tone.icon}`}>
          {type === "success" ? "✓" : "✕"}
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
