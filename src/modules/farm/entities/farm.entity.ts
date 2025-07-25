import { Planting } from '@modules/planting/entities/planting.entity';
import { Producer } from '@modules/producer/entities/producer.entity';

export class Farm {
  id: string;
  name: string;
  city: string;
  state: string;
  totalAreaHectares: number;
  arableAreaHectares: number;
  vegetationAreaHectares: number;
  createdAt: Date;
  updatedAt: Date;

  producer: Producer;
  producerId: string;

  plantings: Planting[];
}
