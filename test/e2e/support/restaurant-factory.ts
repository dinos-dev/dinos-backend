import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';

export type SeededRestaurant = { id: number; name: string };

export const E2E_RESTAURANT_NAME = '리뷰 e2e 식당';

/**
 * 자체 수집된 restaurants를 참조하는 구조에 맞춰 pin/review 대상 가게를 미리 시드한다.
 * (기존 Naver upsert 로직 제거 후, 클라는 restaurantId만 전달)
 */
export async function seedRestaurant(
  prisma: PrismaService,
  overrides: { name?: string; latitude?: number; longitude?: number } = {},
): Promise<SeededRestaurant> {
  const name = overrides.name ?? E2E_RESTAURANT_NAME;
  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      address: `${name} 주소`,
      latitude: overrides.latitude ?? 37.5,
      longitude: overrides.longitude ?? 127.0,
      lastSyncedAt: new Date(),
      category: '한식',
    },
  });

  return { id: restaurant.id, name: restaurant.name };
}
