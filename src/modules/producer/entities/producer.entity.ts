import { Farm } from '@modules/farm/entities/farm.entity';

export class Producer {
  id: string;
  cpfCnpj: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  farms: Farm[];
}
