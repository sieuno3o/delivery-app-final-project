export default function RestaurantLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="식당 정보를 불러오는 중"
      className="min-h-screen bg-[var(--surface)] px-6 text-[var(--ink)] sm:px-10"
    >
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="flex items-center justify-between border-b border-black/10 py-5">
          <div className="h-7 w-24 rounded bg-black/10" />
          <div className="h-9 w-36 rounded-full bg-black/10" />
        </div>
        <div className="my-16 overflow-hidden rounded-[2.25rem] bg-white ring-1 ring-black/5 lg:grid lg:grid-cols-2">
          <div className="min-h-72 bg-black/10 lg:min-h-[28rem]" />
          <div className="space-y-5 p-10">
            <div className="h-4 w-28 rounded bg-orange-200" />
            <div className="h-12 w-3/4 rounded-xl bg-black/10" />
            <div className="h-5 w-full rounded bg-black/8" />
            <div className="h-5 w-4/5 rounded bg-black/8" />
          </div>
        </div>
      </div>
    </main>
  );
}
