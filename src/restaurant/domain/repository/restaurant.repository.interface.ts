export interface IRestaurantRepository {
  existsById(id: number): Promise<boolean>;
  updatePrimaryImageIfNotSet(restaurantId: number, imageUrl: string, userId: number): Promise<void>;
}
