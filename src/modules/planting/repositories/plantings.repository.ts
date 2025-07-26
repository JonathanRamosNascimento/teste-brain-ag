import { Planting } from '@modules/planting/entities/planting.entity';
import { CreatePlantingDto } from '../dto/create-planting.dto';

export abstract class PlantingsRepository {
  abstract create(data: CreatePlantingDto): Promise<Planting>;
  abstract findByCropAndSeasonAndFarm(
    cropId: string,
    seasonId: string,
    farmId: string,
  ): Promise<Planting | null>;
}
