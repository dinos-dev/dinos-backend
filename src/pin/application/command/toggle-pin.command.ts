export class TogglePinCommand {
  constructor(
    public readonly userId: number,
    public readonly restaurantId: number,
  ) {}
}
