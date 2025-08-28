export class UserProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly nickName: string,
    public readonly comment?: string,
    public readonly headerId?: number,
    public readonly bodyId?: number,
    public readonly headerColor?: string,
    public readonly bodyColor?: string,
  ) {}
}
