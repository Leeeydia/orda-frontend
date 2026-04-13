import BottomNav from "@/components/layout/BottomNav";
import Header, { HEADER_HEIGHT } from "@/components/layout/Header";
import { GUIDE_CARDS, QUOTES, variantStyles } from "./guideConstants";

const BOTTOM_NAV_HEIGHT = 82;

const getTodayQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
};

const GuidePage = () => {
  const quote = getTodayQuote();

  return (
    <div
      className="bg-bg-page mx-auto min-h-screen w-full"
      style={{ maxWidth: 390 }}>
      <Header title="등산 가이드" />

      <div
        style={{ paddingTop: HEADER_HEIGHT, paddingBottom: BOTTOM_NAV_HEIGHT }}>
        {/* Hero */}
        <div className="px-4 pt-8 pb-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-primary h-1.5 w-1.5 rounded-full" />
            <span className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              Trail Guide
            </span>
          </div>
          <h2 className="text-primary-dark text-2xl leading-tight font-black tracking-[-0.04em]">
            등산
            <br />
            <span className="text-primary">가이드</span>
          </h2>
          <p className="text-text-muted mt-3 text-sm leading-relaxed">
            산행 전 꼭 알아야 할 것들을 정리했습니다
          </p>
          <div className="bg-primary mt-4 h-[3px] w-9 rounded-full" />
        </div>

        {/* 스탯 카드 */}
        <div className="mb-2 grid grid-cols-2 gap-2 px-4">
          <div className="bg-primary-dark rounded-xl p-4">
            <p className="text-2xl leading-none font-black tracking-[-0.04em] text-white">
              30<span className="text-sm font-bold text-white/70">분</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/80">
              걷고 나면 5-10분
              <br />
              쉬어가세요
            </p>
          </div>
          <div className="border-border-default rounded-xl border bg-white p-4">
            <p className="text-primary-dark text-2xl leading-none font-black tracking-[-0.04em]">
              30<span className="text-primary text-sm font-bold">%</span>
            </p>
            <p className="text-text-muted mt-2 text-xs leading-relaxed">
              하산을 위해
              <br />
              여유를 남겨두세요
            </p>
          </div>
        </div>

        {/* 오늘의 명언 */}
        <div className="bg-primary mx-4 mb-2 flex gap-3 rounded-xl p-4">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.4" />
              <path
                d="M8 5.5v3M8 10.5v.5"
                stroke="white"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold tracking-[0.14em] text-white/60 uppercase">
              오늘의 명언
            </p>
            <p className="text-sm leading-relaxed font-medium text-white">
              "{quote.text}"
            </p>
            <p className="mt-1 text-xs text-white/50">— {quote.author}</p>
          </div>
        </div>

        {/* 가이드 카드 */}
        <div className="flex flex-col gap-2 px-4">
          {GUIDE_CARDS.map((card) => {
            const s = variantStyles[card.variant];
            return (
              <div key={card.index} className={`rounded-xl p-4 ${s.card}`}>
                <p
                  className={`mb-2 text-xs font-bold tracking-[0.14em] uppercase ${s.index}`}>
                  {card.index}
                </p>
                <p
                  className={`mb-4 text-xl leading-tight font-extrabold tracking-[-0.03em] ${s.title}`}>
                  {card.title}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${s.tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default GuidePage;
