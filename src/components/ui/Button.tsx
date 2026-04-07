// src/components/ui/Button.tsx
// ORDA Design System v1.3 기준 (수정)

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "kakao";

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
    "border border-primary text-primary bg-transparent hover:bg-bg-soft active:opacity-60 transition-colors duration-150",
  kakao:
    "bg-[#FEE500] text-[#191919] hover:bg-[#F0D900] active:opacity-60 transition-colors duration-150"
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
 * ORDA 공통 가로형 CTA 버튼 컴포넌트
 *
 * 표준 가로형 CTA 버튼을 위한 컴포넌트입니다.
 * 등산 시작 / 정상 인증처럼 아이콘+텍스트 세로 배열 구조는
 * 별도 ActionTileButton 컴포넌트를 사용하세요.
 *
 * - type: 기본값 "button", form submit 시 type="submit" 명시
 * - 높이: py-4
 * - 너비: 기본 w-full, className으로 오버라이드 가능 (w-fit / flex-1 등)
 * - radius: rounded-xl
 * - variant: primary | secondary | ghost | kakao
 * - icon: 선택적으로 왼쪽 아이콘 삽입
 * - isLoading: true일 때 스피너 표시 + 비활성 처리
 *
 * @example
 * // 일반 CTA 버튼 (기본 type="button")
 * <Button variant="primary">홈으로</Button>
 *
 * // form submit 버튼
 * <Button type="submit" variant="primary">로그인</Button>
 *
 * // 로딩 상태
 * <Button variant="primary" isLoading>저장 중</Button>
 *
 * // 카카오 로그인 버튼
 * <Button variant="kakao">카카오로 시작하기</Button>
 */
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
