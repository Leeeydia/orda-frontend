import { joinClassNames } from "@/utils/classNames";

type SummaryNoticeTone = "default" | "warning";
type SummaryNoticeSurface = "white" | "soft";

type SummaryNoticeProps = {
  message: string;
  tone?: SummaryNoticeTone;
  surface?: SummaryNoticeSurface;
  className?: string;
};

const SummaryNotice = ({
  message,
  tone = "default",
  surface = "white",
  className
}: SummaryNoticeProps) => {
  const toneClassName =
    tone === "warning"
      ? "border border-amber-200 bg-amber-50 text-amber-700"
      : surface === "soft"
        ? "border border-primary/10 bg-bg-page text-body/80"
        : "border border-primary/10 bg-white text-body/80";

  return (
    <div
      className={joinClassNames(
        "rounded-2xl px-3 py-2 text-xs font-medium",
        toneClassName,
        className
      )}>
      {message}
    </div>
  );
};

export default SummaryNotice;