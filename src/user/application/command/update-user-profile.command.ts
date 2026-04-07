export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly nickname?: string,
    public readonly comment?: string | null,
    public readonly headerId?: number | null,
    public readonly bodyId?: number | null,
    public readonly headerColor?: string | null,
    public readonly bodyColor?: string | null,
  ) {}
}
