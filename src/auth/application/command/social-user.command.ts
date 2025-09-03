import { Provider } from 'src/user/domain/const/provider.enum';

export class SocialUserCommand {
  constructor(
    public email: string,
    public name: string,
    public provider: Provider,
    public providerId: string,
  ) {}
}
