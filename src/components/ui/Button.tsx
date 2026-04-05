// src/components/ui/Button.tsx
// ORDA Design System v1.3 기준 (수정)

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:opacity-60 transition-colors duration-150",
  secondary:
    "bg-secondary border border-border-default text-heading hover:bg-accent active:opacity-60 transition-colors duration-150",
  ghost:
    "border border-primary text-primary bg-transparent hover:bg-bg-soft active:opacity-60 transition-colors duration-150"
};

const disabledClass =
  "bg-[#D7DACB] text-muted cursor-not-allowed pointer-events-none";

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/**
 * ORDA 공통 버튼 컴포넌트
 *
 * - 높이: py-4 (아이콘 유무에 따라 자연스럽게 대응)
 * - 너비: 기본 w-full, className으로 오버라이드 가능 (w-fit / flex-1 등)
 * - radius: rounded-xl
 * - variant: primary | secondary | ghost
 * - icon: 선택적으로 왼쪽 아이콘 삽입
 * - isLoading: true일 때 스피너 표시 + 비활성 처리
 *
 * @example
 * // 아이콘 포함 Primary 버튼
 * <Button variant="primary" icon={<EditIcon />}>개인 정보 수정</Button>
 *
 * // 아이콘 없는 Secondary 버튼
 * <Button variant="secondary">로그아웃</Button>
 *
 * // 짧은 버튼
 * <Button variant="ghost" className="w-fit">취소</Button>
 *
 * // 반반 버튼 (팝업 내부)
 * <Button variant="secondary" className="flex-1">계속하기</Button>
 *
 * // 로딩 상태
 * <Button variant="primary" isLoading>저장 중</Button>
 */
const Button = ({
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon,
  children,
  className = "",
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4",
        "text-sm font-semibold",
        isDisabled ? disabledClass : variantClass[variant],
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
