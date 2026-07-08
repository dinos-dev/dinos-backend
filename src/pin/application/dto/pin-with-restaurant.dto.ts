// import { PinType } from 'src/pin/domain/const/pin.enum';

export class PinWithRestaurantDto {
  constructor(
    public readonly pinId: number,
    public readonly restaurantId: number,
    public readonly restaurantName: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly address: string,
    public readonly category: string | null,
    public readonly distanceKm: number,
    // public readonly pinType: PinType,
    public readonly pinnedAt: Date,
    //? 상세보기용 - 가게 대표 썸네일
    public readonly primaryImageUrl: string | null,
    //? 상세보기용 - 내가 이 가게에 작성한 최신 리뷰 내용 (없으면 null)
    public readonly myReviewContent: string | null,
    //? 이 가게를 나와 동일하게 핀한 친구 수
    public readonly friendPinCount: number,
  ) {}
}
