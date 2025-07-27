import { CreatePlantingDto } from '@modules/planting/dto/create-planting.dto';
import { Planting } from '@modules/planting/entities/planting.entity';
import { PlantingsRepository } from '@modules/planting/repositories/plantings.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class PrismaPlantingsRepository implements PlantingsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  async create(data: CreatePlantingDto): Promise<Planting> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'create',
      'plantings',
      undefined,
      `${data.farmId}-${data.cropId}-${data.seasonId}`,
    );

    const planting = await this.prisma.planting.create({
      data,
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'create',
      'plantings',
      duration,
      planting.id,
    );

    return {
      ...planting,
      plantedAreaHectares: planting.plantedAreaHectares.toNumber(),
    };
  }

  async findByCropAndSeasonAndFarm(
    cropId: string,
    seasonId: string,
    farmId: string,
  ): Promise<Planting | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findByCropAndSeasonAndFarm',
      'plantings',
      undefined,
      `${farmId}-${cropId}-${seasonId}`,
    );

    const planting = await this.prisma.planting.findUnique({
      where: {
        farmId_seasonId_cropId: { cropId, seasonId, farmId },
      },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findByCropAndSeasonAndFarm',
      'plantings',
      duration,
      planting ? 'encontrado' : 'não encontrado',
    );

    if (!planting) {
      return null;
    }

    return {
      ...planting,
      plantedAreaHectares: planting.plantedAreaHectares.toNumber(),
    };
  }
}
