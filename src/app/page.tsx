import { AuthNav } from "@/components/auth/auth-nav";

const milestones = [
  {
    label: "완료",
    title: "데이터베이스",
    description: "Docker PostgreSQL과 Drizzle로 식당·메뉴·주문 구조를 만들었습니다.",
  },
  {
    label: "완료",
    title: "회원 인증",
    description: "bcrypt 비밀번호와 HTTP-only DB 세션 로그인을 구현했습니다.",
  },
  {
    label: "다음",
    title: "식당과 메뉴",
    description: "DB의 식당과 메뉴를 실제 화면에 연결하고 탐색 흐름을 만듭니다.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-black/10 pb-5">
          <a className="text-xl font-black tracking-[-0.04em]" href="#top">
            동네한입
          </a>
          <AuthNav />
        </header>

        <section
          className="flex flex-1 flex-col justify-center py-16 sm:py-24"
          id="top"
        >
          <p className="mb-5 text-sm font-bold text-[var(--accent)]">
            DELIVERY, MADE CLEAR
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.08] tracking-[-0.06em] sm:text-7xl">
            우리 동네 맛집을
            <br />한 번에, 한입에.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">
            식당과 메뉴를 둘러보고 장바구니에 담아 주문한 뒤, 주문 상태와
            지난 주문까지 확인하는 풀스택 배달 서비스입니다.
          </p>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {milestones.map((milestone) => (
              <article
                className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(33,31,28,0.06)] ring-1 ring-black/5"
                key={milestone.title}
              >
                <span className="text-xs font-bold text-[var(--accent)]">
                  {milestone.label}
                </span>
                <h2 className="mt-3 text-xl font-extrabold tracking-[-0.03em]">
                  {milestone.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/55">
                  {milestone.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-black/10 py-5 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <span>컴퓨터과학개론 · 배달앱 만들기 &amp; 배포</span>
          <span>Next.js · PostgreSQL · Vercel</span>
        </footer>
      </div>
    </main>
  );
}
