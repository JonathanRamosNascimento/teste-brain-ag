import { CreatePlantingDto } from '@modules/planting/dto/create-planting.dto';
import { Planting } from '@modules/planting/entities/planting.entity';
import { PlantingsRepository } from '@modules/planting/repositories/plantings.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPlantingsRepository implements PlantingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePlantingDto): Promise<Planting> {
    const planting = await this.prisma.planting.create({
      data,
    });

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
    const planting = await this.prisma.planting.findUnique({
      where: {
        farmId_seasonId_cropId: { cropId, seasonId, farmId },
      },
    });

    if (!planting) {
      return null;
    }

    return {
      ...planting,
      plantedAreaHectares: planting.plantedAreaHectares.toNumber(),
    };
  }
}
