export default function Loading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="식당 목록을 불러오는 중"
      className="min-h-screen bg-[var(--surface)] px-6 text-[var(--ink)] sm:px-10"
    >
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="flex items-center justify-between border-b border-black/10 py-5">
          <div className="h-7 w-24 rounded-lg bg-black/10" />
          <div className="h-9 w-36 rounded-full bg-black/10" />
        </div>
        <div className="py-20">
          <div className="h-4 w-36 rounded bg-orange-200" />
          <div className="mt-6 h-14 max-w-2xl rounded-2xl bg-black/10" />
          <div className="mt-3 h-14 max-w-xl rounded-2xl bg-black/10" />
          <div className="mt-7 h-5 max-w-lg rounded bg-black/8" />
        </div>
        <div className="grid gap-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/5"
              key={index}
            >
              <div className="h-44 bg-black/10" />
              <div className="space-y-3 p-5">
                <div className="h-6 w-2/3 rounded bg-black/10" />
                <div className="h-4 w-full rounded bg-black/8" />
                <div className="h-4 w-4/5 rounded bg-black/8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
