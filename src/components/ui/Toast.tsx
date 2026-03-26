import { useEffect } from "react";
import styles from "./Toast.module.css";

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
      className={`${styles.toast} ${type === "success" ? styles.success : styles.error}`}
      role="alert"
      aria-live="assertive">
      <span className={styles.icon} aria-hidden="true">
        {type === "success" ? "✓" : "✕"}
      </span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="닫기">
        ×
      </button>
    </div>
  );
}
