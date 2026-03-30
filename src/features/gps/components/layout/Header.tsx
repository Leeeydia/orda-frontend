// src/components/layout/Header.tsx

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import OrdaLogo from "@/assets/icons/ORDA_logo_가로형.svg?react";

type HeaderProps = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
  subTitle?: string;
};

const Header = ({ leftSlot, rightSlot, title, subTitle }: HeaderProps) => {
  return (
    <nav className="sticky top-0 z-50 grid grid-cols-3 items-center border-b border-[#424434]/10 bg-white/90 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center">{leftSlot}</div>

      <div className="flex flex-col items-center">
        {title ? (
          <>
            {subTitle && (
              <span className="text-[10px] font-bold tracking-widest text-[#87933C] uppercase">
                {subTitle}
              </span>
            )}
            <span className="text-sm leading-tight font-bold text-[#424434]">
              {title}
            </span>
          </>
        ) : (
          <Link to="/">
            <OrdaLogo className="h-8 w-auto" />
          </Link>
        )}
      </div>

      <div className="flex items-center justify-end">{rightSlot}</div>
    </nav>
  );
};

export default Header;
