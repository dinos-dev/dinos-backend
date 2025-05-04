import { Provider } from '../helper/provider.enum';

export interface TokenPayLoad {
  sub?: number;
  email?: string;
  name?: string;
  role?: string;
}

export interface OAuthPayLoad {
  email: string;
  name?: string | null;
  provider: Provider;
  providerId: string;
}
