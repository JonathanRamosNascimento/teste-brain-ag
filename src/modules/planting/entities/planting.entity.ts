import { Farm } from '@modules/farm/entities/farm.entity';
import { Season } from '@modules/season/entities/season.entity';
import { Crop } from '@modules/crop/entities/crop.entity';

export class Planting {
  id: string;
  plantedAreaHectares: number;
  plantingDate?: Date;
  expectedHarvestDate?: Date;
  notes?: string;

  farm: Farm;
  farmId: string;

  season: Season;
  seasonId: string;

  crop: Crop;
  cropId: string;
}
