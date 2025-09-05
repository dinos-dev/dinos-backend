export class Section {
  constructor(
    public readonly restaurantId: string,
    public readonly storeName: string,
    public readonly description: string,
    public readonly summary: string,
    public readonly address: string,
    public readonly businessHours: string,
    public readonly menus: { name: string; price: string }[],
    public readonly imageUrls: string[],
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}

  // 추후 어드민(admin)에서 사용할 수 있기 때문에 정적 생성자 메서드로 정의
  static create(props: SectionProps): Section {
    return new Section(
      props.restaurantId,
      props.storeName,
      props.description,
      props.summary,
      props.address,
      props.businessHours,
      props.menus ?? [],
      props.imageUrls ?? [],
      props.latitude,
      props.longitude,
    );
  }
}

export interface SectionProps {
  restaurantId: string;
  storeName: string;
  description: string;
  summary: string;
  address: string;
  businessHours: string;
  menus?: { name: string; price: string }[];
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
}
