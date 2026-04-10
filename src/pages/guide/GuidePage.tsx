import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";

const QUOTES = [
  { text: "내려갈 때 보았네, 올라갈 때 못 본 그 꽃을.", author: "고은" },
  { text: "천천히 가는 자가 멀리 간다.", author: "격언" },
  { text: "산을 오르는 것은 자신을 오르는 것이다.", author: "미상" },
  { text: "정상에 오르기 전까지는 정상이 없다.", author: "미상" },
  { text: "길이 없으면 길을 만들면 된다.", author: "미상" },
  { text: "오르지 못할 나무는 쳐다보지도 마라.", author: "속담" },
  { text: "한 걸음 한 걸음이 정상을 만든다.", author: "미상" },
  { text: "산은 높지 않다. 오르지 않을 뿐이다.", author: "미상" },
  { text: "산이 거기 있기 때문에 오른다.", author: "조지 맬러리" },
  { text: "정상은 목적지가 아니라 여정의 일부다.", author: "라인홀트 메스너" },
  {
    text: "산은 우리를 기다려주지 않는다. 우리가 찾아가야 한다.",
    author: "에드먼드 힐러리"
  },
  {
    text: "위험을 감수하지 않으면 아무것도 얻을 수 없다.",
    author: "라인홀트 메스너"
  },
  { text: "정상에 오르는 방법은 하나가 아니다.", author: "에드먼드 힐러리" },
  { text: "산은 거짓말하지 않는다.", author: "알피니스트 격언" },
  { text: "두려움은 산보다 높지 않다.", author: "미상" },
  {
    text: "발이 가면 눈이 따라가고, 눈이 가면 마음이 따라간다.",
    author: "미상"
  },
  { text: "가장 높은 산도 첫 발걸음부터 시작된다.", author: "노자" },
  { text: "산은 흔들리지 않는다. 나도 그래야 한다.", author: "미상" },
  { text: "지금 힘들다면 올라가고 있다는 뜻이다.", author: "미상" },
  {
    text: "정상에서의 1분은 오르는 과정의 모든 것을 보상한다.",
    author: "미상"
  },
  { text: "포기하고 싶을 때가 가장 정상에 가까운 순간이다.", author: "미상" },
  { text: "산을 옮기는 자는 작은 돌부터 들어낸다.", author: "중국 속담" },
  { text: "끝까지 걸으면 언젠가는 닿는다.", author: "미상" },
  { text: "힘든 길이 아름다운 곳으로 이어진다.", author: "미상" },
  {
    text: "산행은 인생의 축소판이다. 준비한 만큼 즐길 수 있다.",
    author: "미상"
  },
  { text: "바람이 강한 곳에 뿌리가 깊은 나무가 산다.", author: "미상" },
  {
    text: "올라가는 길이 힘들수록 내려올 때 더 많은 것을 가져온다.",
    author: "미상"
  },
  { text: "자연 앞에서 인간은 겸손해진다.", author: "미상" },
  { text: "걷는 것은 생각하는 것이다.", author: "장 자크 루소" },
  { text: "산에서는 속도가 아니라 방향이 중요하다.", author: "미상" },
  { text: "정상에서 흘리는 눈물은 땀인지 감동인지 모른다.", author: "미상" },
  { text: "정상에 가면 뭐가 있냐고? 내가 있다.", author: "미상" },
  { text: "산이 준 고통은 산이 준 선물이다.", author: "미상" },
  { text: "산이 날 부른다. 근데 몸이 거절한다.", author: "미상" },
  { text: "오늘 이 발걸음이 훗날 가장 잘한 일이 될 것이다.", author: "미상" },
  { text: "준비된 자만이 정상을 즐긴다.", author: "미상" },
  { text: "산은 항상 거기 있다. 서두르지 마라.", author: "미상" },
  { text: "정상에 서는 순간, 살아있음을 느낀다.", author: "미상" },
  { text: "체력의 절반은 하산을 위해 남겨둬라.", author: "등산 격언" },
  { text: "혼자 가면 빠르고, 함께 가면 멀리 간다.", author: "아프리카 속담" }
];

const getTodayQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
};

const GUIDE_CARDS = [
  {
    index: "01 — 출발 전",
    title: "준비물",
    variant: "white" as const,
    tags: [
      "등산화",
      "방수 재킷",
      "식수 · 비상식량",
      "날씨 확인",
      "지인에게 공유"
    ]
  },
  {
    index: "02 — 산행 중",
    title: "안전 수칙",
    variant: "accent" as const,
    tags: [
      "야간 산행 금지",
      "번개 시 즉시 이탈",
      "119 앱 설치",
      "무릎 보호대",
      "입산 통제 확인"
    ]
  },
  {
    index: "03 — 예절",
    title: "산에서 지킬 것",
    variant: "primary" as const,
    tags: ["길 양보", "쓰레기 되가져오기", "먹이 주기 금지", "소음 자제"]
  }
];

const variantStyles = {
  white: {
    card: "bg-white border border-[#D7DACB]",
    index: "text-[#B8BAA8]",
    title: "text-[#4A521E]",
    tag: "bg-[#F4F5EF] text-[#3D3D2E] border border-[#D7DACB]"
  },
  accent: {
    card: "bg-[#DFE6BA]",
    index: "text-[#89943d]",
    title: "text-[#4A521E]",
    tag: "bg-white/60 text-[#4A521E]"
  },
  primary: {
    card: "bg-[#4A521E]",
    index: "text-[#89943d]/70",
    title: "text-white",
    tag: "bg-white/10 text-white/85"
  }
};

const GuidePage = () => {
  const quote = getTodayQuote();

  return (
    <div
      className="mx-auto min-h-screen w-full bg-[#F7F7F6]"
      style={{ maxWidth: 390 }}>
      <Header title="등산 가이드" />

      <div className="pt-16 pb-24">
        {/* Hero */}
        <div className="px-6 pt-9 pb-7">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#89943d]" />
            <span className="text-[11px] font-semibold tracking-[0.18em] text-[#89943d] uppercase">
              Trail Guide
            </span>
          </div>
          <h2 className="text-[48px] leading-[0.92] font-black tracking-[-0.04em] text-[#4A521E]">
            등산
            <br />
            <span className="text-[#89943d]">가이드</span>
          </h2>
          <p className="mt-3.5 text-[13px] leading-relaxed text-[#7A8070]">
            산행 전 꼭 알아야 할 것들을 정리했습니다
          </p>
          <div className="mt-4 h-[3px] w-9 rounded-full bg-[#89943d]" />
        </div>

        {/* 스탯 카드 */}
        <div className="mb-2 grid grid-cols-2 gap-2 px-5">
          <div className="rounded-2xl bg-[#4A521E] p-5">
            <p className="text-[36px] leading-none font-black tracking-[-0.04em] text-[#89943d]">
              30
              <span className="text-[13px] font-bold text-[#89943d]/70">
                분
              </span>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-white/50">
              걷고 5-10분
              <br />
              휴식 권장
            </p>
          </div>
          <div className="rounded-2xl border border-[#D7DACB] bg-white p-5">
            <p className="text-[36px] leading-none font-black tracking-[-0.04em] text-[#4A521E]">
              30<span className="text-[13px] font-bold text-[#89943d]">%</span>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-[#7A8070]">
              체력 하산용
              <br />
              반드시 비축
            </p>
          </div>
        </div>

        {/* 오늘의 명언 */}
        <div className="mx-5 mb-2 flex gap-3 rounded-2xl bg-[#89943d] px-[18px] py-4">
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
            <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-white/60 uppercase">
              오늘의 명언
            </p>
            <p className="text-[13px] leading-relaxed font-medium text-white">
              "{quote.text}"
            </p>
            <p className="mt-1 text-[11px] text-white/50">— {quote.author}</p>
          </div>
        </div>

        {/* 가이드 카드 */}
        <div className="flex flex-col gap-2 px-5">
          {GUIDE_CARDS.map((card) => {
            const s = variantStyles[card.variant];
            return (
              <div
                key={card.index}
                className={`rounded-2xl p-[22px] ${s.card}`}>
                <p
                  className={`mb-2 text-[10px] font-bold tracking-[0.14em] uppercase ${s.index}`}>
                  {card.index}
                </p>
                <p
                  className={`mb-4 text-[20px] leading-tight font-extrabold tracking-[-0.03em] ${s.title}`}>
                  {card.title}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${s.tag}`}>
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
