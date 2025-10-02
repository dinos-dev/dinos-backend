import { Provider } from '../const/provider.enum';

export class UserEntity {
  constructor(
    public readonly id: number | null,
    public email: string,
    public name: string | null,
    public password: string | null,
    public isActive: boolean,
    public provider: Provider,
    public providerId: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public deletedAt: Date | null,
    public version: number | null,
    // public readonly tokens: TokenEntity[],
  ) {}

  static create(params: {
    email: string;
    name?: string | null;
    password?: string | null;
    provider?: Provider;
    providerId?: string | null;
  }): UserEntity {
    return new UserEntity(
      null,
      params.email,
      params.name ?? null,
      params.password ?? null,
      true,
      params.provider ?? Provider.LOCAL,
      params.providerId ?? null,
      null,
      null,
      null,
      0,
      // [],
      // null,
    );
  }

  softDelete() {
    this.deletedAt = new Date();
  }
}
