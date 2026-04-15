import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import BackButton from "@/components/layout/BackButton";
import Button from "@/components/ui/Button";

type ReplayScaffoldStateTone = "neutral" | "error";

type ReplayScaffoldStateProps = {
  message: string;
  tone?: ReplayScaffoldStateTone;
};

const REPLAY_STATE_META: Record<
  ReplayScaffoldStateTone,
  {
    eyebrow: string;
    title: string;
  }
> = {
  neutral: {
    eyebrow: "리플레이",
    title: "리플레이 정보를 준비하고 있어요"
  },
  error: {
    eyebrow: "리플레이 오류",
    title: "리플레이를 불러오지 못했어요"
  }
};

const ReplayScaffoldState = ({
  message,
  tone = "neutral"
}: ReplayScaffoldStateProps) => {
  const navigate = useNavigate();
  const meta = REPLAY_STATE_META[tone];
  const isError = tone === "error";

  return (
    <div className="min-h-screen bg-bg-page">
      <Header leftSlot={<BackButton />} title="리플레이" />

      <main className="mx-auto flex min-h-screen w-full max-w-[390px] items-center px-4 pt-20 pb-6">
        <section
          className={
            isError
              ? "w-full overflow-hidden rounded-3xl border border-error/15 bg-white shadow-sm"
              : "w-full overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm"
          }>
          <div
            className={
              isError
                ? "border-b border-error/10 bg-gradient-to-r from-error/10 via-error/5 to-transparent px-4 py-3"
                : "border-b border-primary/8 bg-gradient-to-r from-primary/12 via-primary/6 to-transparent px-4 py-3"
            }>
            <p
              className={
                isError
                  ? "text-[11px] font-semibold tracking-[0.04em] text-error"
                  : "text-[11px] font-semibold tracking-[0.04em] text-primary"
              }>
              {meta.eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-heading">
              {meta.title}
            </h2>
          </div>

          <div className="px-4 py-4">
            <div
              className={
                isError
                  ? "rounded-2xl border border-error/10 bg-error/5 px-3 py-3 text-sm leading-5 text-body"
                  : "rounded-2xl border border-primary/10 bg-bg-page px-3 py-3 text-sm leading-5 text-body"
              }>
              {message}
            </div>

            {isError ? (
              <div className="mt-4">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  이전 화면으로
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReplayScaffoldState;