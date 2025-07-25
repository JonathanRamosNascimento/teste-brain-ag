import { Planting } from '@modules/planting/entities/planting.entity';

export class Crop {
  id: string;
  name: string;
  description?: string;
  category?: string;

  plantings: Planting[];
}
