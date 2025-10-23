export class UserRegisteredEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly registrationType: 'local' | 'social',
    public readonly timestamp: Date = new Date(),
  ) {}
}
