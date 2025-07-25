import { Planting } from '@modules/planting/entities/planting.entity';

export class Season {
  id: string;
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  active: boolean;

  plantings: Planting[];
}
