import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePlantingDto } from '../dto/create-planting.dto';
import { Planting } from '../entities/planting.entity';
import { PlantingsRepository } from '../repositories/plantings.repository';
import { FindCropById } from '@modules/crop/use-cases/abstractions/find-crop-by-id.abstraction';
import { FindFarmById } from '@modules/farm/use-cases/abstractions/find-farm-by-id.abstraction';
import { FindSeasonById } from '@modules/season/use-cases/abstractions/find-season-by-id.abstraction';

@Injectable()
export class CreatePlantingUseCase {
  constructor(
    private readonly repository: PlantingsRepository,
    private readonly findCropById: FindCropById,
    private readonly findSeasonById: FindSeasonById,
    private readonly findFarmById: FindFarmById,
  ) {}

  async execute(data: CreatePlantingDto): Promise<Planting> {
    await this.findCropById.execute(data.cropId);
    await this.findSeasonById.execute(data.seasonId);
    await this.findFarmById.execute(data.farmId);

    const planting = await this.repository.findByCropAndSeasonAndFarm(
      data.cropId,
      data.seasonId,
      data.farmId,
    );

    if (planting) {
      throw new ConflictException('Plantio já cadastrado');
    }

    return await this.repository.create(data);
  }
}
