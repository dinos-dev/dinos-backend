import { PinEntity } from '../entities/pin.entity';

export interface IPinRepository {
  create(entity: PinEntity): Promise<PinEntity>;
  removeById(id: number): Promise<PinEntity>;
}
