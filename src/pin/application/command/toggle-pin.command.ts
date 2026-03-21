export class TogglePinCommand {
  constructor(
    public readonly userId: number,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly category?: string | null,
  ) {}
}
