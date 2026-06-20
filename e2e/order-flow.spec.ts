import { expect, test, type Page } from "@playwright/test";
import postgres from "postgres";

const customerEmail = "e2e-customer@example.test";
const adminEmail = "e2e-admin@example.test";
const password = "E2e-password-2026";

async function cleanUpE2EData() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("E2E 테스트에 DATABASE_URL이 필요합니다.");
  }

  const sql = postgres(databaseUrl, { max: 1, prepare: false });

  try {
    await sql.begin(async (transaction) => {
      await transaction`
        delete from order_status_history
        where order_id in (
          select id from orders
          where user_id in (
            select id from users
            where email = ${customerEmail} or email = ${adminEmail}
          )
        )
      `;
      await transaction`
        delete from order_items
        where order_id in (
          select id from orders
          where user_id in (
            select id from users
            where email = ${customerEmail} or email = ${adminEmail}
          )
        )
      `;
      await transaction`
        delete from orders
        where user_id in (
          select id from users
          where email = ${customerEmail} or email = ${adminEmail}
        )
      `;
      await transaction`
        delete from users
        where email = ${customerEmail} or email = ${adminEmail}
      `;
    });
  } finally {
    await sql.end();
  }
}

async function signUp(
  page: Page,
  name: string,
  email: string,
) {
  await page.goto("/signup");
  await page.getByLabel("이름").fill(name);
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByLabel("비밀번호 확인").fill(password);
  await page.getByRole("button", { name: "회원가입" }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe.serial("필수 시연 전체 흐름", () => {
  test.beforeAll(cleanUpE2EData);
  test.afterAll(cleanUpE2EData);

  test("회원가입부터 주문, 관리자 상태 변경, 고객 확인까지 완료한다", async ({
    page,
  }) => {
    await signUp(page, "E2E 고객", customerEmail);

    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    await page.goto("/restaurants/seongsu-kitchen");
    await page
      .getByRole("button", { name: "불향 베이컨 크림 파스타 담기" })
      .click();
    await page
      .getByRole("button", { name: "불향 베이컨 크림 파스타 담기" })
      .click();
    await expect(page.getByText("장바구니에 2개")).toBeVisible();

    await page.getByRole("link", { name: /장바구니 2개/ }).click();
    await expect(page.getByRole("heading", { name: "장바구니" })).toBeVisible();
    await page.getByRole("link", { name: "주문하기" }).click();

    await page.getByLabel("배송 주소").fill("서울시 성동구 성수이로 12");
    await page.getByLabel("상세 주소").fill("101동 202호");
    await page.getByLabel("배달 요청사항").fill("문 앞에 놓아주세요.");
    await page.getByRole("button", { name: "주문 확정하기" }).click();

    await expect(
      page.getByRole("heading", { name: "주문이 접수됐어요!" }),
    ).toBeVisible();
    await expect(
      page.getByText("주문 접수", { exact: true }).first(),
    ).toBeVisible();
    const orderUrl = page.url();
    const orderId = orderUrl.match(/\/orders\/([^?]+)/)?.[1];
    expect(orderId).toBeTruthy();

    await page.getByRole("button", { name: "로그아웃" }).click();
    await signUp(page, "E2E 관리자", adminEmail);
    await page.goto(`/admin/orders/${orderId}`);
    await expect(
      page.getByRole("heading", { name: "주문 상태 변경" }),
    ).toBeVisible();
    await page.getByLabel("다음 상태").selectOption("preparing");
    await page.getByLabel("관리 메모").fill("E2E 조리 시작 확인");
    await page.getByRole("button", { name: "상태 변경" }).click();
    await expect(page.getByText("E2E 조리 시작 확인")).toBeVisible();
    await expect(page.getByLabel("다음 상태")).toHaveValue("delivering");

    await page.getByRole("button", { name: "로그아웃" }).click();
    await page.getByLabel("이메일").fill(customerEmail);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto(`/orders/${orderId}`);
    await expect(page.getByText("조리 중", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("E2E 조리 시작 확인")).toBeVisible();
  });

  test("식당 검색과 카테고리 필터가 함께 동작한다", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("식당 이름").fill("성수키친");
    await page.getByLabel("음식 종류").selectOption({ label: "양식" });
    await page.getByRole("button", { name: "조건 적용" }).click();

    await expect(
      page.getByRole("link", { name: "성수키친 식당 보기" }),
    ).toBeVisible();
    await expect(page.getByText("검색 결과 1곳")).toBeVisible();
  });

  test("360px 모바일에서 하단 내비게이션과 레이아웃이 깨지지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");

    await expect(
      page.getByRole("navigation", { name: "모바일 주요 메뉴" }),
    ).toBeVisible();
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows).toBe(false);
  });
});
