export class SharedPinFriendProfileDto {
  constructor(
    public readonly nickname: string,
    public readonly comment: string | null,
    public readonly headerId: number | null,
    public readonly bodyId: number | null,
    public readonly headerColor: string | null,
    public readonly bodyColor: string | null,
  ) {}
}

export class SharedPinFriendDto {
  constructor(
    public readonly userId: number,
    public readonly profile: SharedPinFriendProfileDto | null,
  ) {}
}

export class SharedPinRestaurantDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly address: string,
    public readonly category: string | null,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly primaryImageUrl: string | null,
  ) {}
}

export class SharedPinsDto {
  constructor(
    public readonly restaurant: SharedPinRestaurantDto,
    public readonly friends: SharedPinFriendDto[],
  ) {}
}

// query 레이어 → service 레이어 간 전달용 flat DTO (restaurant x friend 조합 단위)
export class SharedPinItemDto {
  constructor(
    public readonly restaurantId: number,
    public readonly restaurantName: string,
    public readonly address: string,
    public readonly category: string | null,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly primaryImageUrl: string | null,
    public readonly friendUserId: number,
    public readonly friendProfile: SharedPinFriendProfileDto | null,
  ) {}
}
