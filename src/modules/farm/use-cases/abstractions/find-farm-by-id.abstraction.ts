import { Farm } from '@modules/farm/entities/farm.entity';

export abstract class FindFarmById {
  abstract execute(id: string): Promise<Farm>;
}
