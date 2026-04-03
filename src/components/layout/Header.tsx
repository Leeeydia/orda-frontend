// src/components/layout/Header.tsx

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import OrdaLogo from "@/assets/icons/ORDA_logo.svg?react";

type HeaderProps = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
  subTitle?: string;
};

const Header = ({ leftSlot, rightSlot, title, subTitle }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-1/2 z-50 h-14 w-full max-w-[390px] -translate-x-1/2 border-b border-[#D7DACB] bg-white">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex h-10 w-10 items-center justify-start">
          {leftSlot}
        </div>

        <div className="flex flex-1 flex-col items-center px-2">
          {title ? (
            <>
              {subTitle && (
                <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                  {subTitle}
                </p>
              )}
              <h1 className="text-heading text-lg font-semibold">{title}</h1>
            </>
          ) : (
            <Link to="/">
              <OrdaLogo className="h-6 w-auto" />
            </Link>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-end">
          {rightSlot}
        </div>
      </div>
    </header>
  );
};

export default Header;
