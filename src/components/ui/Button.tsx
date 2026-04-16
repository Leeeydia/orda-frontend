import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const baseClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold transition-colors duration-150";

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:opacity-60",
  secondary:
    "border border-border-default bg-secondary text-heading hover:bg-accent active:opacity-60",
  ghost:
    "border border-primary bg-transparent text-primary hover:bg-bg-soft active:opacity-60"
};

const disabledClass =
  "bg-border-default text-muted cursor-not-allowed pointer-events-none";

const Spinner = () => (
  <svg
    className="h-5 w-5 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const Button = ({
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon,
  children,
  className = "",
  type,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type ?? "button"}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={[
        baseClass,
        isDisabled ? disabledClass : variantClassMap[variant],
        className
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}>
      {isLoading ? <Spinner /> : icon}
      {children}
    </button>
  );
};

export default Button;
