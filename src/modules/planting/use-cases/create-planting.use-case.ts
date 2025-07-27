import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePlantingDto } from '../dto/create-planting.dto';
import { Planting } from '../entities/planting.entity';
import { PlantingsRepository } from '../repositories/plantings.repository';
import { FindCropById } from '@modules/crop/use-cases/abstractions/find-crop-by-id.abstraction';
import { FindFarmById } from '@modules/farm/use-cases/abstractions/find-farm-by-id.abstraction';
import { FindSeasonById } from '@modules/season/use-cases/abstractions/find-season-by-id.abstraction';
import { LoggingService } from '@logging/logging.service';

@Injectable()
export class CreatePlantingUseCase {
  constructor(
    private readonly repository: PlantingsRepository,
    private readonly findCropById: FindCropById,
    private readonly findSeasonById: FindSeasonById,
    private readonly findFarmById: FindFarmById,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(data: CreatePlantingDto): Promise<Planting> {
    this.loggingService.logBusinessLogic(
      'CreatePlantingUseCase',
      'Iniciando criação de plantio',
      {
        cropId: data.cropId,
        seasonId: data.seasonId,
        farmId: data.farmId,
        plantedAreaHectares: data.plantedAreaHectares,
      },
    );

    await this.findCropById.execute(data.cropId);
    await this.findSeasonById.execute(data.seasonId);
    await this.findFarmById.execute(data.farmId);

    const planting = await this.repository.findByCropAndSeasonAndFarm(
      data.cropId,
      data.seasonId,
      data.farmId,
    );

    if (planting) {
      this.loggingService.logBusinessLogic(
        'CreatePlantingUseCase',
        'Tentativa de criar plantio duplicado',
        {
          cropId: data.cropId,
          seasonId: data.seasonId,
          farmId: data.farmId,
          existingPlantingId: planting.id,
        },
      );
      throw new ConflictException('Plantio já cadastrado');
    }

    const newPlanting = await this.repository.create(data);

    this.loggingService.logBusinessLogic(
      'CreatePlantingUseCase',
      'Plantio criado com sucesso',
      {
        plantingId: newPlanting.id,
        cropId: data.cropId,
        seasonId: data.seasonId,
        farmId: data.farmId,
        plantedAreaHectares: data.plantedAreaHectares,
      },
    );

    return newPlanting;
  }
}
