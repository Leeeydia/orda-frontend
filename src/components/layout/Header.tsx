// src/components/layout/Header.tsx

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import OrdaLogo from "@/assets/icons/ORDA_logo.svg?react";

type HeaderProps = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
};

/** Header 높이 상수 — py-3(24px) + h-10(40px) = 64px */
export const HEADER_HEIGHT = 64;

const Header = ({ leftSlot, rightSlot, title }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center">
          {leftSlot}
        </div>

        <div className="flex flex-1 flex-col items-center px-2">
          {title ? (
            <>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#89943d] uppercase">
                ORDA
              </p>
              <h1 className="text-base font-bold tracking-tight text-[#2f3415]">
                {title}
              </h1>
            </>
          ) : (
            <Link to="/">
              <OrdaLogo className="h-6 w-auto" />
            </Link>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center">
          {rightSlot}
        </div>
      </div>
    </header>
  );
};

export default Header;
