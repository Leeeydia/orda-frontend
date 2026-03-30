import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useMyPage from "../features/mypage/hooks/useMyPage";

// HikingRecord의 number | null 필드를 안전하게 number로 변환
const toNum = (v: number | null | undefined): number => v ?? 0;

const MyPage = () => {
  const {
    profile,
    stats,
    records,
    loading,
    error,
    handleUploadImage,
    handleDeleteImage
  } = useMyPage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  // [윤종민] 개인 정보 수정 페이지 이동용
  const navigate = useNavigate();
  // 프로필 이미지 변경 바텀시트 표시 여부
  const [showImageSheet, setShowImageSheet] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadImage(file);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#89943d] border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-[#89943d]">
            불러오는 중...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f6]">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white"
      style={{ maxWidth: 390, margin: "0 auto" }}>
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-50 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center text-slate-900">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold tracking-tight text-slate-900">
          마이페이지
        </h1>
        <div className="h-10 w-10" />
      </header>

      {/* ── 프로필 섹션 ── */}
      <section className="flex flex-col items-center px-6 pt-8 pb-6">
        {/* 아바타 */}
        <div className="relative">
          {profile?.profileImageUrl ? (
            <img
              src={`http://localhost:8080${profile.profileImageUrl}`}
              alt="프로필 이미지"
              className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-[#89943d]/15"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#f7f7f6] shadow-md ring-4 ring-[#89943d]/10">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#89943d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}

          {/* [윤종민] 카메라 아이콘 클릭 → 팝오버로 변경/삭제 선택 */}
          <div className="relative">
            <button
              onClick={() => setShowImageSheet((v) => !v)}
              title="프로필 이미지 변경"
              className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#89943d] text-white shadow-md transition-transform active:scale-90">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>

            {/* 팝오버 */}
            {showImageSheet && (
              <>
                {/* 투명 딤 — 바깥 클릭 시 닫기 */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowImageSheet(false)}
                />
                {/* 팝오버 카드 */}
                <div className="absolute right-0 bottom-10 z-50 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                  {/* 앨범에서 선택 */}
                  <button
                    onClick={() => {
                      setShowImageSheet(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#89943d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span className="text-[13px] font-semibold text-slate-800">
                      앨범에서 선택
                    </span>
                  </button>

                  {/* 기본 이미지로 변경 — 이미지 있을 때만 */}
                  {profile?.profileImageUrl && (
                    <>
                      <div className="mx-3 border-t border-slate-100" />
                      <button
                        onClick={async () => {
                          setShowImageSheet(false);
                          await handleDeleteImage();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-red-50 active:bg-red-100">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="text-[13px] font-semibold text-red-500">
                          기본 이미지로
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <input
            type="file"
            accept="image/jpg, image/jpeg, image/png"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* 닉네임 / 이메일 */}
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-[22px] font-bold tracking-tight text-slate-900">
            {profile?.nickname ?? "—"}
          </p>
          <p className="text-[10px] font-bold tracking-widest text-[#89943d] uppercase">
            ORDA Member
          </p>
          <p className="mt-1 text-sm text-slate-400">{profile?.email}</p>
        </div>
      </section>

      {/* ── 통계 섹션 ── */}
      <section className="px-6 pb-6">
        <div className="rounded-xl border border-[#89943d]/8 bg-[#f7f7f6] p-5">
          <p className="mb-4 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">
            나의 등산 통계
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#89943d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M3 17l4-8 4 4 4-6 4 10" />
                </svg>
              }
              label="총 등산 횟수"
              value={`${stats?.totalHikes ?? 0}회`}
            />
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#89943d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              label="총 정상 인증"
              value={`${stats?.totalSummits ?? 0}회`}
            />
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#89943d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              label="총 거리"
              value={`${((stats?.totalDistanceM ?? 0) / 1000).toFixed(1)}km`}
            />
            <StatCard
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#89943d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
                </svg>
              }
              label="누적 고도"
              value={`${stats?.totalElevationGainM ?? 0}m`}
            />
          </div>
        </div>
      </section>

      {/* ── 등산 기록 섹션 ── */}
      <section className="px-6 pb-6">
        <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">
          등산 기록
        </p>

        {(records ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-[#f7f7f6] py-10">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#89943d"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4">
              <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
            </svg>
            <p className="text-sm text-slate-400">아직 등산 기록이 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((record) => (
              <RecordCard key={record.sessionId} record={record} />
            ))}
          </div>
        )}
      </section>

      {/* 하단 버튼 공간 확보 */}
      <div className="h-28" />

      {/* ── 개인 정보 수정 버튼 (하단 고정) ── */}
      {/* [윤종민] 개인 정보 수정 페이지 이동 버튼 */}
      <div
        className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 border-t border-slate-100 bg-white px-6 pt-3 pb-8"
        style={{ maxWidth: 390 }}>
        <button
          onClick={() => navigate("/edit-profile")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#89943d] py-4 text-sm font-bold tracking-wide text-white shadow-md shadow-[#89943d]/20 transition-transform active:scale-[0.98]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          개인 정보 수정
        </button>
      </div>
    </div>
  );
};

/* ────────────── 서브 컴포넌트 ────────────── */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#89943d]/10">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

interface RecordCardProps {
  record: {
    sessionId: number | string;
    startedAt: string;
    totalDistanceM: number | null;
    totalDurationSec: number | null;
  };
}

const RecordCard = ({ record }: RecordCardProps) => {
  const formatDuration = (sec: number | null) => {
    if (!sec) return "—";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const formatDate = (raw: string) => {
    try {
      const d = new Date(raw);
      return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
    } catch {
      return raw;
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
      {/* 아이콘 배지 */}
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#89943d]/10">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#89943d"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-sm font-bold text-slate-900">
          {formatDate(record.startedAt)}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {(toNum(record.totalDistanceM) / 1000).toFixed(1)}km
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-200" />
          <span className="text-xs text-slate-500">
            {formatDuration(record.totalDurationSec)}
          </span>
        </div>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
};

export default MyPage;
