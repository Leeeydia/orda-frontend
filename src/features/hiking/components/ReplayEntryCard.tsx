import { useNavigate } from "react-router-dom";

type ReplayEntryCardProps = {
  sessionId: number | null;
};

export default function ReplayEntryCard({ sessionId }: ReplayEntryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (sessionId == null) return;
    navigate(`/hiking/sessions/${sessionId}/replay`);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-primary-dark to-primary px-5 py-5 text-white">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-white/80">
          리플레이
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight">
          경로 다시 보기
        </h2>
        <p className="mt-2 text-sm text-white/80">
          저장된 GPS 트랙을 시간 흐름에 따라 다시 확인할 수 있습니다.
        </p>

        <button
          type="button"
          onClick={handleClick}
          disabled={sessionId == null}
          className="text-heading mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/70 disabled:text-muted">
          리플레이 보기
        </button>
      </div>
    </section>
  );
}