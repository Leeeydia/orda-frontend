import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import OrdaLogo from "@/assets/icons/ORDA_logo.svg?react";

type HeaderProps = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
};

/** Header 높이 상수 — py-3(24px) + h-11(44px) = 68px */
export const HEADER_HEIGHT = 68;

const Header = ({ leftSlot, rightSlot, title }: HeaderProps) => {
  return (
    <header className="border-primary/10 fixed top-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 border-b bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {leftSlot}
        </div>

        <div className="min-w-0 flex-1 px-2 text-center">
          {title ? (
            <div className="space-y-1">
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                ORDA
              </p>
              <h1 className="text-heading truncate text-base leading-6 font-bold">
                {title}
              </h1>
            </div>
          ) : (
            <Link
              to="/hiking"
              aria-label="홈으로 이동"
              className="inline-flex items-center justify-center">
              <OrdaLogo className="text-primary h-6 w-auto" />
            </Link>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {rightSlot}
        </div>
      </div>
    </header>
  );
};

export default Header;
