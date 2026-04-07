type ReplayScaffoldStateProps = {
  message: string;
  tone?: "neutral" | "error";
  onBack?: () => void;
};

export default function ReplayScaffoldState({
  message,
  tone = "neutral",
  onBack
}: ReplayScaffoldStateProps) {
  const sectionClass =
    tone === "error"
      ? "rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm"
      : "rounded-3xl border border-[#89943d]/10 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm";

  return (
    <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
        <header className="sticky top-0 z-30 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
          <div className="px-4 py-3">
            <div className="flex h-10 items-center justify-between rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] px-4 text-xs font-medium text-[#89943d]/70">
              <span>Header Placeholder</span>

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-full px-2 py-1 text-[#4a521e] transition hover:bg-[#89943d]/10">
                  뒤로가기
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 pt-4 pb-6">
          <section className={sectionClass}>{message}</section>
        </main>

        <div className="sticky bottom-0 border-t border-[#89943d]/10 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex h-14 items-center justify-center rounded-2xl border border-dashed border-[#89943d]/20 bg-[#f7f7f6] text-xs font-medium text-[#89943d]/70">
            Bottom Tab Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}