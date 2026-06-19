import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { menuItems, restaurants } from "../src/db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl) {
  throw new Error("DATABASE_URL 환경 변수가 필요합니다.");
}

type SeedMenu = {
  name: string;
  description: string;
  category: string;
  price: number;
  isPopular?: boolean;
  isSoldOut?: boolean;
};

type SeedRestaurant = {
  slug: string;
  name: string;
  description: string;
  category: string;
  address: string;
  deliveryFee: number;
  minimumOrderAmount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  ratingTenths: number;
  reviewCount: number;
  menus: SeedMenu[];
};

function menu(
  name: string,
  description: string,
  category: string,
  price: number,
  options: Partial<Pick<SeedMenu, "isPopular" | "isSoldOut">> = {},
): SeedMenu {
  return { name, description, category, price, ...options };
}

const seedData: SeedRestaurant[] = [
  {
    slug: "seongsu-kitchen",
    name: "성수키친",
    description: "불향 가득한 파스타와 수제 리소토를 만드는 동네 양식당",
    category: "양식",
    address: "서울 성동구 연무장길 21",
    deliveryFee: 2500,
    minimumOrderAmount: 15000,
    deliveryTimeMin: 25,
    deliveryTimeMax: 40,
    ratingTenths: 48,
    reviewCount: 1284,
    menus: [
      menu("불향 베이컨 크림 파스타", "직화 베이컨과 진한 크림소스", "파스타", 13900, { isPopular: true }),
      menu("새우 로제 파스타", "탱글한 새우와 매콤한 로제소스", "파스타", 14900, { isPopular: true }),
      menu("트러플 버섯 리소토", "버섯과 트러플 향을 살린 리소토", "리소토", 14500),
      menu("고르곤졸라 피자", "꿀과 함께 즐기는 얇은 도우 피자", "피자", 15900),
      menu("리코타 치즈 샐러드", "리코타 치즈와 제철 채소 샐러드", "사이드", 8900),
    ],
  },
  {
    slug: "hanok-bapsang",
    name: "한옥밥상",
    description: "매일 아침 만드는 반찬과 따뜻한 국이 있는 한식 밥상",
    category: "한식",
    address: "서울 종로구 계동길 45",
    deliveryFee: 2000,
    minimumOrderAmount: 12000,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    ratingTenths: 47,
    reviewCount: 932,
    menus: [
      menu("직화 제육 한상", "직화 제육볶음과 오늘의 반찬 4종", "한상", 12500, { isPopular: true }),
      menu("간장 불고기 한상", "부드러운 소불고기와 오늘의 반찬", "한상", 13900),
      menu("고등어구이 한상", "노릇하게 구운 고등어와 된장국", "한상", 12900),
      menu("묵은지 김치찌개", "푹 익은 묵은지와 돼지고기 김치찌개", "찌개", 9500, { isPopular: true }),
      menu("계란말이", "채소를 넣어 도톰하게 부친 계란말이", "사이드", 6500),
    ],
  },
  {
    slug: "myeongdong-banjeom",
    name: "명동반점",
    description: "센 불에서 빠르게 볶아내는 짜장면과 얼큰한 짬뽕",
    category: "중식",
    address: "서울 중구 명동8길 17",
    deliveryFee: 3000,
    minimumOrderAmount: 14000,
    deliveryTimeMin: 30,
    deliveryTimeMax: 45,
    ratingTenths: 46,
    reviewCount: 1587,
    menus: [
      menu("옛날 짜장면", "춘장과 양파를 오래 볶은 기본 짜장면", "면", 7500, { isPopular: true }),
      menu("불맛 해물짬뽕", "오징어와 홍합을 넣은 얼큰한 짬뽕", "면", 9500, { isPopular: true }),
      menu("새우볶음밥", "고슬고슬한 밥과 통통한 새우", "밥", 9000),
      menu("찹쌀 탕수육", "쫀득한 찹쌀옷과 새콤달콤 소스", "요리", 18900),
      menu("군만두 8개", "바삭하게 구운 고기 군만두", "사이드", 6000),
    ],
  },
  {
    slug: "tokyo-sushi-lab",
    name: "도쿄스시랩",
    description: "주문 즉시 쥐어내는 초밥과 신선한 사시미",
    category: "일식",
    address: "서울 마포구 동교로 188",
    deliveryFee: 3500,
    minimumOrderAmount: 18000,
    deliveryTimeMin: 30,
    deliveryTimeMax: 50,
    ratingTenths: 49,
    reviewCount: 764,
    menus: [
      menu("오늘의 초밥 10P", "오늘 가장 신선한 생선으로 구성한 모둠 초밥", "초밥", 18900, { isPopular: true }),
      menu("연어 초밥 10P", "두툼하게 썬 노르웨이산 연어 초밥", "초밥", 17900),
      menu("특선 사시미", "광어·연어·참치로 구성한 사시미", "사시미", 25900, { isPopular: true }),
      menu("냉모밀", "직접 우린 쯔유와 메밀면", "면", 8500),
      menu("새우튀김 5P", "바삭한 튀김옷의 왕새우튀김", "사이드", 9000),
    ],
  },
  {
    slug: "burger-station",
    name: "버거스테이션",
    description: "매일 직접 빚는 소고기 패티와 폭신한 브리오슈 번",
    category: "버거",
    address: "서울 용산구 이태원로 204",
    deliveryFee: 1900,
    minimumOrderAmount: 11000,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    ratingTenths: 45,
    reviewCount: 2103,
    menus: [
      menu("스테이션 클래식 버거", "소고기 패티와 아메리칸 치즈의 기본 버거", "버거", 8900, { isPopular: true }),
      menu("더블 치즈 버거", "패티 두 장과 치즈 두 장의 진한 풍미", "버거", 11900),
      menu("스파이시 치킨 버거", "매콤한 닭다리살 패티와 코울슬로", "버거", 9500),
      menu("트러플 감자튀김", "트러플 오일과 파르메산 치즈 감자튀김", "사이드", 5900, { isPopular: true }),
      menu("바닐라 밀크셰이크", "마다가스카르 바닐라로 만든 밀크셰이크", "음료", 5500),
    ],
  },
  {
    slug: "green-table",
    name: "그린테이블",
    description: "신선한 채소와 든든한 단백질을 담은 샐러드와 포케",
    category: "샐러드",
    address: "서울 강남구 도산대로52길 12",
    deliveryFee: 1500,
    minimumOrderAmount: 10000,
    deliveryTimeMin: 15,
    deliveryTimeMax: 30,
    ratingTenths: 47,
    reviewCount: 689,
    menus: [
      menu("연어 아보카도 포케", "생연어와 아보카도, 현미밥을 담은 포케", "포케", 13900, { isPopular: true }),
      menu("닭가슴살 시저 샐러드", "수비드 닭가슴살과 로메인 시저 샐러드", "샐러드", 11900),
      menu("두부 버섯 웜볼", "구운 두부와 버섯, 귀리를 담은 따뜻한 볼", "웜볼", 12500),
      menu("그릭 요거트볼", "그릭 요거트와 제철 과일, 그래놀라", "요거트", 8500, { isPopular: true }),
      menu("ABC 착즙주스", "사과·비트·당근을 바로 착즙한 주스", "음료", 5900, { isSoldOut: true }),
    ],
  },
];

async function seed() {
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle(client);

  try {
    await db.transaction(async (tx) => {
      for (const seedRestaurant of seedData) {
        const { menus, ...restaurantValues } = seedRestaurant;
        const [restaurant] = await tx
          .insert(restaurants)
          .values(restaurantValues)
          .onConflictDoUpdate({
            target: restaurants.slug,
            set: {
              name: restaurantValues.name,
              description: restaurantValues.description,
              category: restaurantValues.category,
              address: restaurantValues.address,
              deliveryFee: restaurantValues.deliveryFee,
              minimumOrderAmount: restaurantValues.minimumOrderAmount,
              deliveryTimeMin: restaurantValues.deliveryTimeMin,
              deliveryTimeMax: restaurantValues.deliveryTimeMax,
              ratingTenths: restaurantValues.ratingTenths,
              reviewCount: restaurantValues.reviewCount,
              isActive: true,
              updatedAt: new Date(),
            },
          })
          .returning({ id: restaurants.id });

        if (!restaurant) {
          throw new Error(`${restaurantValues.name} 식당 저장에 실패했습니다.`);
        }

        for (const [position, seedMenu] of menus.entries()) {
          await tx
            .insert(menuItems)
            .values({
              restaurantId: restaurant.id,
              position,
              isPopular: false,
              isSoldOut: false,
              ...seedMenu,
            })
            .onConflictDoUpdate({
              target: [menuItems.restaurantId, menuItems.name],
              set: {
                description: seedMenu.description,
                category: seedMenu.category,
                price: seedMenu.price,
                position,
                isPopular: seedMenu.isPopular ?? false,
                isSoldOut: seedMenu.isSoldOut ?? false,
                updatedAt: new Date(),
              },
            });
        }
      }
    });

    const menuCount = seedData.reduce(
      (sum, restaurant) => sum + restaurant.menus.length,
      0,
    );
    console.info(
      `시드 완료: 식당 ${seedData.length}개, 메뉴 ${menuCount}개`,
    );
  } finally {
    await client.end();
  }
}

seed().catch((error: unknown) => {
  console.error("시드 실행 실패", error);
  process.exitCode = 1;
});
