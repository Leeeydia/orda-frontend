import { useLocation, useNavigate } from "react-router-dom";

export const BOTTOM_NAV_HEIGHT = 64;

const NAV_ITEMS = [
  {
    label: "가이드",
    path: "/guide",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${active ? "text-primary" : "text-muted"}`}
        aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    label: "지도",
    path: "/hiking",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${active ? "text-primary" : "text-muted"}`}
        aria-hidden="true">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    )
  },
  {
    label: "프로필",
    path: "/mypage",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${active ? "text-primary" : "text-muted"}`}
        aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="하단 네비게이션"
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 border-t border-default bg-white">
      <div className="flex h-16 items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              aria-current={active ? "page" : undefined}
              className="flex h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-150 active:opacity-60">
              {item.icon(active)}

              <span
                className={`text-xs leading-4 ${
                  active ? "text-primary" : "text-muted"
                }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;