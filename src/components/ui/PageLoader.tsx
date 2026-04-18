export default function PageLoader() {
  return (
    <div className="bg-page flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        <p className="text-primary text-sm font-medium tracking-wide">
          불러오는 중...
        </p>
      </div>
    </div>
  );
}
