# 동네한입 기말 프로젝트 최종 보고서

- 운영 URL: https://dongne-hanip-kohl.vercel.app
- GitHub: https://github.com/sieuno3o/delivery-app-final-project
- 기술: Next.js App Router, TypeScript, PostgreSQL/Neon, Drizzle ORM, Tailwind CSS, Docker Compose, Vercel

## 1. 데이터베이스 구조와 설계 이유

상세 ERD와 전체 관계 설명은 [`docs/database.md`](./database.md)에 정리했다. 모든 테이블은 `id`를 PK로 사용하며 주요 FK는 다음과 같다.

| 테이블 | 한 줄 역할 | PK / 주요 FK |
| --- | --- | --- |
| `users` | 이메일, bcrypt 비밀번호 해시, 고객·관리자 역할을 저장한다. | PK `users.id` |
| `sessions` | 원문 대신 해시한 로그인 토큰과 만료 시각을 저장한다. | PK `sessions.id` · FK `sessions.user_id → users.id` |
| `restaurants` | 식당 정보, 카테고리, 배달비, 최소 주문 금액을 저장한다. | PK `restaurants.id` |
| `menu_items` | 식당별 현재 메뉴, 가격, 품절 여부를 저장한다. | PK `menu_items.id` · FK `menu_items.restaurant_id → restaurants.id` |
| `orders` | 주문자·식당·배송지·현재 상태·총액·중복 방지 키를 저장한다. | PK `orders.id` · FK `orders.user_id → users.id` · FK `orders.restaurant_id → restaurants.id` |
| `order_items` | 주문 당시 메뉴명·단가 스냅샷과 수량을 저장한다. | PK `order_items.id` · FK `order_items.order_id → orders.id` · FK `order_items.menu_item_id → menu_items.id` |
| `order_status_history` | 상태가 언제 누구에 의해 변경됐는지 누적한다. | PK `order_status_history.id` · FK `order_status_history.order_id → orders.id` · FK `changed_by_user_id → users.id` |

### 왜 테이블을 나눴는가

- **주문과 주문상세:** 한 주문에는 메뉴가 여러 개이므로 배송지·총액 같은 공통값은 `orders`, 반복되는 메뉴명·단가·수량은 `order_items`로 분리했다. 주문 당시 메뉴명과 단가를 스냅샷으로 저장해 이후 이름·가격이 바뀌어도 결제 기록은 유지된다. 운영 중에는 삭제보다 `is_sold_out`으로 품절 처리하며, 삭제 시에도 `ON DELETE SET NULL`로 메뉴 연결만 끊고 스냅샷은 보존한다.
- **현재 상태와 상태 이력:** 목록에서 자주 읽는 현재 상태는 `orders.status`, 모든 변경 과정은 `order_status_history`에 저장해 조회 속도와 추적 가능성을 함께 확보했다.
- **사용자와 세션:** 한 사용자가 여러 기기에서 로그인할 수 있고 세션마다 만료 시각이 다르므로 계정과 세션을 분리했다. DB에는 탈취 위험을 줄이기 위해 세션 토큰 원문 대신 SHA-256 해시만 저장한다.
- **장바구니와 주문:** 장바구니는 주문 전 임시 상태이므로 별도 DB 테이블 없이 브라우저 `localStorage`에서 관리한다. 주문하기를 누르면 서버가 식당·메뉴·현재 가격·품절 여부를 다시 검증한 뒤 `orders`, `order_items`, `order_status_history`에 영구 저장한다.

### 주문 저장과 데이터 일관성

로그인·권한 확인 → 식당과 메뉴 재조회 → 현재 가격·품절·최소 주문 금액 검증 → 서버에서 합계 재계산 → 하나의 트랜잭션에서 `orders` 1행, `order_items` 여러 행, 최초 상태 이력 저장 → 모두 성공하면 커밋, 하나라도 실패하면 전체 롤백한다.

`orders.id`와 별도로 UUID 형식의 `idempotency_key`에 고유 제약을 두고, 같은 키의 요청이 재전송되면 기존 주문을 반환해 동일 제출 요청의 중복 저장을 막는다. 주문 조회에는 주문 ID와 현재 로그인한 `user_id`를 함께 사용해 다른 사용자의 주문을 볼 수 없게 했다. 로컬은 Docker Compose의 PostgreSQL, 운영은 Neon PostgreSQL을 사용하며 같은 Drizzle 마이그레이션으로 스키마를 맞췄다.

## 2. 직접 겪고 해결한 문제 3개

### BUG-004 — 검은 링크 버튼의 글자가 보이지 않음 (영상 설명 버그)

- **사용자 영향:** 회원가입·식당 이동 같은 핵심 버튼의 텍스트를 알아볼 수 없었다.
- **첫 추측과 측정:** Tailwind 클래스 생성 또는 캡처 문제라고 생각했지만, `getComputedStyle($0).color`로 측정하니 배경과 글자색이 모두 `rgb(33, 31, 28)`이었다.
- **실제 원인:** 레이어 밖 전역 `a { color: inherit }`가 Tailwind `@layer utilities` 안의 `text-white`보다 캐스케이드에서 우선했다.
- **해결·검증:** `!important`로 덮지 않고 불필요한 전역 규칙을 제거했다(커밋 `e62c1e3`). 글자색이 `rgb(255, 255, 255)`로 바뀌고 실제 화면에서도 정상 표시되는지 확인했다.

### BUG-005 — 주문 완료 안내가 즉시 사라짐

- **증상:** 주문은 DB에 저장됐지만 `주문이 접수됐어요!` 안내가 거의 즉시 일반 상세 화면으로 바뀌었다.
- **실제 원인:** 장바구니를 비운 클라이언트 효과가 `router.replace`로 서버 컴포넌트를 재렌더링하며 완료 조건인 `placed=1`을 즉시 제거했다.
- **해결·검증:** `history.replaceState`로 주소만 정리했다. 현재 완료 화면은 유지되고 새로고침할 때만 일반 상세가 열리는지 실제 주문으로 확인했다.

### BUG-006 — 운영 주문 시간이 9시간 느림

- **증상:** 같은 주문이 로컬에서는 한국 시간, Vercel에서는 정확히 9시간 전으로 표시됐다.
- **실제 원인:** PostgreSQL `timestamptz`의 UTC 저장은 정상이었지만 `Intl.DateTimeFormat`이 실행 서버의 기본 시간대에 의존했다. 로컬 macOS는 KST, Vercel 서버는 UTC였다.
- **해결·검증:** 날짜 포맷에 `timeZone: "Asia/Seoul"`을 명시하고 운영 재배포 후 같은 주문이 한국 시간으로 표시되는지 확인했다.

## 3. AI 활용의 한계와 남은 제약

AI 제안을 정답으로 취급하지 않았다. CSS 문제는 명시도 추측만으로 해결되지 않아 브라우저의 계산된 스타일과 CSS 레이어, Git diff를 직접 비교해 원인을 확정했다. 배포 환경의 시간대 오류도 DB 저장값과 실행 환경을 따로 확인해야 했다. 기능은 DB, 인증, 장바구니, 주문, 배포, 버그 수정, 테스트 단위로 커밋하고 실제 브라우저·DB·자동 검사로 재검증했다.

실제 결제, 이메일 인증, 실시간 라이더 위치는 외부 서비스 연동, 개인정보 보호, 비용 범위 때문에 구현하지 않고 주문 저장과 상태 타임라인까지로 제한했다. 물리 기기의 모바일 네트워크 확인, 영상 녹화와 최종 제출도 사람이 직접 수행해야 한다.

## 4. 기능 및 검증 체크

과제 필수 기능 5개는 모두 구현했다. 가산 요소로 검색·복합 필터, 품절 처리, 주문 상태 타임라인, 관리자 상태 변경, 모바일 UI를 추가 구현했다.

| 영역 | 검증 내용 | 결과 |
| --- | --- | ---: |
| 필수 기능 5개 | 인증(회원가입·로그인·로그아웃) · 식당/메뉴 · 장바구니 · 주문 저장 · 내 주문내역 | **5 / 5** |
| 가산 요소 | 검색·카테고리/배달비/최소 주문 필터 · 품절 처리 · 상태 타임라인 · 관리자 상태 변경 · 모바일 UI | 구현 |
| 2026-06-24 재검증 | ESLint · TypeScript · Vitest 28개 · Next.js 프로덕션 빌드 | 통과 |
| 브라우저 통합 검증 | Playwright: 가입→주문→관리자 변경→고객 확인, 필터, 360px 레이아웃 | **3 / 3** |
| 배포 | Vercel 공개 URL과 로그인 경로 HTTP 200 | 통과 |
