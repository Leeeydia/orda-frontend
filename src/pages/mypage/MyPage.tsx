import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useMyPage from "../../features/mypage/hooks/useMyPage";

const toNum = (v: number | null | undefined): number => v ?? 0;

const API_URL = import.meta.env.VITE_API_URL ?? "";

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
  const navigate = useNavigate();
  const [showImageSheet, setShowImageSheet] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 비로그인 상태에서 마이페이지 접근 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadImage(file);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-primary">
            불러오는 중...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <p className="text-sm text-error">{error}</p>
      </div>
    );

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-x-hidden bg-white">
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-default bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center text-heading">
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
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight text-heading">
          마이페이지
        </h1>
        <div className="h-10 w-10" />
      </header>

      {/* ── 프로필 섹션 ── */}
      <section className="flex flex-col items-center px-4 pt-8 pb-6">
        <div className="relative">
          {profile?.profileImageUrl ? (
            <img
              src={`${API_URL}${profile.profileImageUrl}`}
              alt="프로필 이미지"
              className="h-28 w-28 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-page shadow-md">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary opacity-40">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowImageSheet((v) => !v)}
              title="프로필 이미지 변경"
              className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md transition-colors duration-150 active:opacity-60">
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

            {showImageSheet && (
              <>
                <div
                  className="fixed inset-0 z-[150]"
                  onClick={() => setShowImageSheet(false)}
                />
                <div className="absolute right-0 bottom-10 z-[200] w-44 overflow-hidden rounded-2xl border border-default bg-white shadow-xl">
                  <button
                    onClick={() => {
                      setShowImageSheet(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary active:bg-secondary">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span className="text-sm font-semibold text-body">
                      앨범에서 선택
                    </span>
                  </button>

                  {profile?.profileImageUrl && (
                    <>
                      <div className="mx-3 border-t border-default" />
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
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-error">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="text-sm font-semibold text-error">
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

        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-xl font-bold tracking-tight text-heading">
            {profile?.nickname ?? "—"}
          </p>
          <p className="text-xs font-bold tracking-wider text-primary uppercase">
            ORDA Member
          </p>
          <p className="mt-1 text-sm text-muted">{profile?.email}</p>
        </div>
      </section>

      {/* ── 통계 섹션 ── */}
      <section className="px-4 pb-6">
        <div className="rounded-xl border border-default bg-page p-4">
          <p className="mb-4 text-xs font-bold tracking-wider text-muted uppercase">
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
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
      <section className="px-4 pb-6">
        <p className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">
          등산 기록
        </p>
        {(records ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-default bg-page py-10">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary opacity-40">
              <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
            </svg>
            <p className="text-sm text-muted">아직 등산 기록이 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((record) => (
              <RecordCard key={record.sessionId} record={record} />
            ))}
          </div>
        )}
      </section>

      <div className="h-36" />

      {/* ── 개인 정보 수정 + 로그아웃 버튼 (하단 고정) ── */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 border-t border-default bg-white px-4 pt-3 pb-8">
        <button
          onClick={() => navigate("/mypage/edit-profile")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-white transition-colors duration-150 active:opacity-60">
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

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-default bg-white py-4 text-sm font-semibold text-muted transition-colors duration-150 active:opacity-60">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          로그아웃
        </button>
      </div>

      {/* ── 로그아웃 확인 팝업 ── */}
      {showLogoutConfirm && (
        <>
          <div
            className="fixed inset-0 z-[150] bg-black/40"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 z-[200] w-72 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-col items-center px-4 pt-8 pb-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-page">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <p className="text-lg font-bold text-heading">로그아웃</p>
              <p className="mt-1.5 text-sm text-muted">
                정말 로그아웃 하시겠어요?
              </p>
            </div>
            <div className="flex border-t border-default">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 text-sm font-semibold text-muted transition-colors duration-150 active:opacity-60">
                취소
              </button>
              <div className="w-px bg-default" />
              <button
                onClick={handleLogout}
                className="flex-1 py-4 text-sm font-bold text-error transition-colors duration-150 active:opacity-60">
                로그아웃
              </button>
            </div>
          </div>
        </>
      )}
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
  <div className="flex flex-col gap-2 rounded-xl border border-default bg-white p-4 shadow-sm">
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold tracking-wider text-muted uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-heading">{value}</p>
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
  const navigate = useNavigate();

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
    <div
      className="flex items-center gap-4 rounded-xl border border-default bg-white p-4 shadow-sm transition-colors duration-150 active:opacity-60"
      onClick={() => navigate(`/hiking/sessions/${record.sessionId}`)}>
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary">
          <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-sm font-bold text-heading">
          {formatDate(record.startedAt)}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {(toNum(record.totalDistanceM) / 1000).toFixed(1)}km
          </span>
          <span className="h-1 w-1 rounded-full bg-default" />
          <span className="text-xs text-muted">
            {formatDuration(record.totalDurationSec)}
          </span>
        </div>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
};

export default MyPage;