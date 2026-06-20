# 동네한입

식당과 메뉴를 둘러보고 장바구니에 담아 주문한 뒤, 주문 상태와 과거 주문 내역을 확인할 수 있는 풀스택 배달 웹 애플리케이션입니다.

컴퓨터과학개론 기말 프로젝트로 제작하며, 로컬 개발 환경부터 PostgreSQL 데이터베이스, 인증, 테스트, 공개 웹 배포까지 하나의 서비스로 완성하는 것이 목표입니다.

> 현재 상태: 필수·추가 기능, 모바일 UI, 자동 테스트, 공개 배포, 최종 보고서 완료

## 프로젝트 목표

- 공개 URL에서 끊김 없는 전체 주문 흐름 제공
- 이메일과 비밀번호 기반의 안전한 회원 인증
- 식당·메뉴·주문 데이터를 PostgreSQL에 영구 저장
- DB 테이블을 나눈 이유와 데이터 저장 흐름을 설명할 수 있는 구조
- 로컬 Docker 환경과 Vercel 운영 환경에서 동일하게 동작
- 실제 개발 중 발생한 버그와 해결 과정을 문서화

## 주요 기능

### 필수 기능

- [x] 회원가입, 로그인, 로그아웃
- [x] 식당 및 메뉴 목록 조회
- [x] 메뉴 장바구니 담기와 수량 변경
- [x] 주문 생성 및 DB 저장
- [x] 사용자별 주문 내역과 주문 상세 조회

### 추가 기능

- [x] 식당 이름 검색과 음식 카테고리 필터
- [x] 배달비와 최소 주문 금액 필터
- [x] 주문 상태 타임라인
- [x] 관리자 주문 상태 변경
- [x] 품절 및 최소 주문 금액 처리
- [x] 모바일 반응형 UI와 하단 내비게이션
- [x] 로딩, 빈 화면, 오류, 알림 상태
- [x] 핵심 주문 흐름 Playwright 자동 테스트

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | Next.js App Router |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 데이터베이스 | PostgreSQL, Neon |
| ORM | Drizzle ORM |
| 인증 | bcrypt, DB Session, HTTP-only Cookie |
| 로컬 환경 | Docker Compose, Make |
| 테스트 | Vitest, Playwright |
| 배포 | GitHub, Vercel |
| 패키지 관리 | pnpm |

## 데이터 모델

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ ORDERS : places
    USERS ||--o{ ORDER_STATUS_HISTORY : changes
    RESTAURANTS ||--o{ MENU_ITEMS : serves
    RESTAURANTS ||--o{ ORDERS : receives
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_STATUS_HISTORY : records
    MENU_ITEMS o|--o{ ORDER_ITEMS : references
```

| 테이블 | 역할 |
| --- | --- |
| `users` | 이메일, 이름, 비밀번호 해시, 사용자 역할 저장 |
| `sessions` | 로그인 세션과 만료 시각 저장 |
| `restaurants` | 식당, 카테고리, 배달비, 최소 주문 금액 저장 |
| `menu_items` | 식당별 메뉴, 가격, 설명, 품절 여부 저장 |
| `orders` | 주문자, 식당, 배송 정보, 총액, 주문 상태 저장 |
| `order_items` | 주문 당시 메뉴명과 가격의 스냅샷 및 수량 저장 |
| `order_status_history` | 주문 상태가 언제 누구에 의해 변경됐는지 저장 |

`orders`와 `order_items`를 분리해 한 주문에 여러 메뉴를 담을 수 있게 합니다. 주문 당시 메뉴명과 가격을 `order_items`에 복사해 두므로, 이후 메뉴 정보가 변경되어도 과거 주문 기록은 변하지 않습니다. 두 테이블과 최초 상태 이력은 하나의 트랜잭션으로 저장해 반쪽짜리 주문이 생기지 않게 합니다. 주문 요청마다 고유 키를 함께 저장해 버튼을 중복으로 눌러도 같은 주문이 두 번 생성되지 않습니다.

## 로컬 실행

Docker PostgreSQL과 시드 데이터를 포함한 전체 로컬 환경을 실행할 수 있습니다.

### 요구 사항

- Node.js 20.9 이상
- pnpm
- Docker Desktop
- Make

### 환경 변수

예제 파일을 복사해 로컬 환경 변수를 설정합니다.

```bash
cp .env.example .env.local
```

주요 환경 변수:

```dotenv
DATABASE_URL=postgresql://delivery:delivery@localhost:5433/delivery
ADMIN_EMAILS=admin@example.com
```

`ADMIN_EMAILS`에는 관리자 화면을 사용할 이메일을 쉼표로 구분해 등록합니다. 해당 이메일로 새로 가입하면 관리자 역할이 부여되고, 기존 계정도 다음 로그인 시 관리자 역할로 승격됩니다. 관리자 화면은 `/admin/orders`에서 접근할 수 있으며 일반 사용자는 주문 데이터 대신 찾을 수 없음 화면을 보게 됩니다.

실제 비밀값이 포함된 환경 변수 파일은 Git에 커밋하지 않습니다.

### 최초 실행

```bash
pnpm install
make up
pnpm db:migrate
pnpm db:seed
pnpm db:check
pnpm dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000), 로컬 PostgreSQL은 호스트의 `5433` 포트에서 실행됩니다. `5432`는 다른 프로젝트와의 충돌을 피하기 위해 사용하지 않습니다.

DB를 완전히 지우고 마이그레이션과 시드를 처음부터 검증하려면 다음 명령을 사용합니다.

```bash
make db-reset
```

### 종료

```bash
make down
```

## 검증 명령

아래 명령을 개별 실행하거나 `pnpm verify`로 한 번에 검증할 수 있습니다.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm verify
```

`pnpm test:e2e`는 프로덕션 빌드를 만든 뒤 실제 Chrome에서 회원가입 → 주문 → 관리자 상태 변경 → 고객 확인, 검색·필터, 360px 모바일 레이아웃을 검증합니다. 로컬 DB에 만든 E2E 계정과 주문은 테스트 전후에 자동 삭제합니다.

## 배포

- 운영 데이터베이스: Neon PostgreSQL
- 웹 애플리케이션: Vercel
- 운영 URL: [https://dongne-hanip-kohl.vercel.app](https://dongne-hanip-kohl.vercel.app)
- GitHub 저장소: [sieuno3o/delivery-app-final-project](https://github.com/sieuno3o/delivery-app-final-project)

Vercel에는 `DATABASE_URL`, `ADMIN_EMAILS` 등 운영용 환경 변수를 별도로 등록합니다. 운영 DB에는 마이그레이션과 시드 데이터를 적용한 뒤 시크릿 브라우저와 모바일 네트워크에서 전체 흐름을 점검합니다.

## 전체 시연 흐름

```text
회원가입 → 로그인 → 식당 검색 → 메뉴 선택 → 장바구니
→ 주문 → 주문 상세 → 주문 내역 → 로그아웃
```

최종 영상에서는 공개 URL의 주소창이 보이는 상태로 위 흐름을 편집 없이 연속 시연합니다.

## 문서

- [전체 작업 목록](./TASKS.md)
- [DB 구조와 설계 이유](./docs/database.md)
- [실제 버그 기록](./docs/bug-log.md)
- [최종 보고서 원문](./docs/final-report.md)
- [10분 시연 영상 대본](./docs/demo-script.md)
- [제출용 A4 2쪽 PDF](./output/pdf/final-project-report.pdf)

## 개발 원칙

- 클라이언트가 전달한 가격과 주문 총액을 신뢰하지 않고 서버에서 재계산합니다.
- 모든 사용자 데이터 조회에는 현재 로그인 사용자의 권한을 확인합니다.
- 기능별로 작고 설명 가능한 Git 커밋을 남깁니다.
- 실제로 겪은 오류만 버그 기록과 발표 자료에 사용합니다.
- 추가 기능보다 필수 주문 흐름의 안정성을 우선합니다.

## 진행 상황

세부 일정, 완료 조건, 권장 커밋 단위는 [TASKS.md](./TASKS.md)에서 관리합니다.
