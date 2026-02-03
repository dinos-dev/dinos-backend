export class BoundingBoxDto {
  constructor(
    public readonly minLat: number,
    public readonly maxLat: number,
    public readonly minLng: number,
    public readonly maxLng: number,
  ) {}

  static create(params: { minLat: number; maxLat: number; minLng: number; maxLng: number }): BoundingBoxDto {
    return new BoundingBoxDto(params.minLat, params.maxLat, params.minLng, params.maxLng);
  }
}
