# 동네한입

식당과 메뉴를 둘러보고 장바구니에 담아 주문한 뒤, 주문 상태와 과거 주문 내역을 확인할 수 있는 풀스택 배달 웹 애플리케이션입니다.

컴퓨터과학개론 기말 프로젝트로 제작하며, 로컬 개발 환경부터 PostgreSQL 데이터베이스, 인증, 테스트, 공개 웹 배포까지 하나의 서비스로 완성하는 것이 목표입니다.

> 현재 상태: Next.js 애플리케이션 기반 완료, Docker 및 DB 구성 예정

## 프로젝트 목표

- 공개 URL에서 끊김 없는 전체 주문 흐름 제공
- 이메일과 비밀번호 기반의 안전한 회원 인증
- 식당·메뉴·주문 데이터를 PostgreSQL에 영구 저장
- DB 테이블을 나눈 이유와 데이터 저장 흐름을 설명할 수 있는 구조
- 로컬 Docker 환경과 Vercel 운영 환경에서 동일하게 동작
- 실제 개발 중 발생한 버그와 해결 과정을 문서화

## 주요 기능

### 필수 기능

- [ ] 회원가입, 로그인, 로그아웃
- [ ] 식당 및 메뉴 목록 조회
- [ ] 메뉴 장바구니 담기와 수량 변경
- [ ] 주문 생성 및 DB 저장
- [ ] 사용자별 주문 내역과 주문 상세 조회

### 추가 기능

- [ ] 식당 이름 검색과 음식 카테고리 필터
- [ ] 배달비 또는 최소 주문 금액 필터
- [ ] 주문 상태 타임라인
- [ ] 관리자 주문 상태 변경
- [ ] 품절 및 최소 주문 금액 처리
- [ ] 모바일 반응형 UI
- [ ] 로딩, 빈 화면, 오류, 알림 상태
- [ ] 핵심 주문 흐름 자동 테스트

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
    RESTAURANTS ||--o{ MENU_ITEMS : serves
    RESTAURANTS ||--o{ ORDERS : receives
    ORDERS ||--|{ ORDER_ITEMS : contains
    MENU_ITEMS ||--o{ ORDER_ITEMS : references
```

| 테이블 | 역할 |
| --- | --- |
| `users` | 이메일, 이름, 비밀번호 해시, 사용자 역할 저장 |
| `sessions` | 로그인 세션과 만료 시각 저장 |
| `restaurants` | 식당, 카테고리, 배달비, 최소 주문 금액 저장 |
| `menu_items` | 식당별 메뉴, 가격, 설명, 품절 여부 저장 |
| `orders` | 주문자, 식당, 배송 정보, 총액, 주문 상태 저장 |
| `order_items` | 주문 당시 메뉴명과 가격의 스냅샷 및 수량 저장 |

`orders`와 `order_items`를 분리해 한 주문에 여러 메뉴를 담을 수 있게 합니다. 주문 당시 메뉴명과 가격을 `order_items`에 복사해 두므로, 이후 메뉴 정보가 변경되어도 과거 주문 기록은 변하지 않습니다. 두 테이블은 하나의 트랜잭션으로 저장해 반쪽짜리 주문이 생기지 않게 합니다.

## 로컬 실행

현재 첫 화면은 DB 없이 바로 실행할 수 있습니다.

### 요구 사항

- Node.js 20.9 이상
- pnpm
- Docker Desktop
- Make

### 환경 변수

DB 작업을 시작할 때 예제 파일을 복사해 로컬 환경 변수를 설정합니다.

```bash
cp .env.example .env.local
```

예정된 주요 환경 변수:

```dotenv
DATABASE_URL=postgresql://delivery:delivery@localhost:5432/delivery
SESSION_SECRET=replace-with-a-long-random-value
ADMIN_EMAILS=admin@example.com
```

실제 비밀값이 포함된 환경 변수 파일은 Git에 커밋하지 않습니다.

### 현재 애플리케이션 실행

```bash
pnpm install
pnpm dev
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

Docker DB, 마이그레이션, 시드 명령은 다음 작업에서 추가합니다.

```bash
make up
pnpm db:migrate
pnpm db:seed
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
pnpm build
pnpm verify
```

## 배포

- 운영 데이터베이스: Neon PostgreSQL
- 웹 애플리케이션: Vercel
- 운영 URL: 구현 후 추가
- GitHub 저장소: 연결 후 추가

Vercel에는 `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAILS` 등 운영용 환경 변수를 별도로 등록합니다. 운영 DB에는 마이그레이션과 시드 데이터를 적용한 뒤 시크릿 브라우저와 모바일 네트워크에서 전체 흐름을 점검합니다.

## 전체 시연 흐름

```text
회원가입 → 로그인 → 식당 검색 → 메뉴 선택 → 장바구니
→ 주문 → 주문 상세 → 주문 내역 → 로그아웃
```

최종 영상에서는 공개 URL의 주소창이 보이는 상태로 위 흐름을 편집 없이 연속 시연합니다.

## 문서

- [전체 작업 목록](./TASKS.md)
- DB 설계 설명: 구현 예정 (`docs/database.md`)
- [실제 버그 기록](./docs/bug-log.md)
- 최종 보고서와 영상 대본: 구현 완료 후 추가

## 개발 원칙

- 클라이언트가 전달한 가격과 주문 총액을 신뢰하지 않고 서버에서 재계산합니다.
- 모든 사용자 데이터 조회에는 현재 로그인 사용자의 권한을 확인합니다.
- 기능별로 작고 설명 가능한 Git 커밋을 남깁니다.
- 실제로 겪은 오류만 버그 기록과 발표 자료에 사용합니다.
- 추가 기능보다 필수 주문 흐름의 안정성을 우선합니다.

## 진행 상황

세부 일정, 완료 조건, 권장 커밋 단위는 [TASKS.md](./TASKS.md)에서 관리합니다.
