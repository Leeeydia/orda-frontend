import { formatDateTime } from "@/utils/format";
import type { HikingSessionResponse } from "../types/hiking.types";

type HikingSessionHeaderProps = {
  session: HikingSessionResponse | null;
};

export default function HikingSessionHeader({
  session
}: HikingSessionHeaderProps) {
  if (!session) {
    return (
      <div className="rounded-full border border-white/35 bg-white/90 px-3 py-2 text-[11px] font-medium text-[#4a521e] shadow-md">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-block h-3 w-20 rounded-full bg-slate-200" />
          <span className="text-[#89943d]/70">•</span>
          <span className="inline-block h-3 w-24 rounded-full bg-slate-200" />
          <span className="text-[#89943d]/70">•</span>
          <span className="inline-block h-4 w-10 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }

  const startedAtText = formatDateTime(session.startedAt);
  const endedAtText = session.endedAt ? formatDateTime(session.endedAt) : null;

  const [dateText, startTimeText = "-"] = startedAtText.split(" ");
  const endTimeText = endedAtText ? endedAtText.split(" ")[1] ?? "-" : null;

  const timeRangeText = endTimeText
    ? `${startTimeText} ~ ${endTimeText}`
    : `${startTimeText} 시작`;

  const statusText = session.endedAt ? "완료" : "진행 중";

  return (
    <div className="rounded-full border border-white/35 bg-white/78 px-3 py-2 text-[11px] font-medium text-[#4a521e] shadow-md backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{dateText}</span>
        <span className="text-[#89943d]/70">•</span>
        <span>{timeRangeText}</span>
        <span className="text-[#89943d]/70">•</span>
        <span className="font-semibold text-[#4a521e]">{statusText}</span>
      </div>
    </div>
  );
}