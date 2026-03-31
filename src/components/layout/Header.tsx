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
    <header className="sticky top-0 z-30 bg-white px-1.5 pt-1.5 pb-1.5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-start">
          {leftSlot}
        </div>

        <div className="flex flex-1 flex-col items-center px-2">
          {title ? (
            <>
              {subTitle && (
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#89943d] uppercase">
                  {subTitle}
                </p>
              )}
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

        <div className="flex h-10 w-10 items-center justify-end">
          {rightSlot}
        </div>
      </div>
    </header>
  );
};

export default Header;
