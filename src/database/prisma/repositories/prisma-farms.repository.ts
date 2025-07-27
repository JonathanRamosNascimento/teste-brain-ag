import { CreateFarmDto } from '@modules/farm/dto/create-farm.dto';
import { Farm } from '@modules/farm/entities/farm.entity';
import { IFarmsByCrop } from '@modules/farm/interfaces/farms-by-crop.interface';
import { IFarmsByState } from '@modules/farm/interfaces/farms-by-state.interface';
import { ILandUsage } from '@modules/farm/interfaces/land-usage.interface';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class PrismaFarmsRepository implements FarmsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  async create(data: CreateFarmDto): Promise<Farm> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'create',
      'farms',
      undefined,
      data.name,
    );

    const farm = await this.prisma.farm.create({
      data,
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'create',
      'farms',
      duration,
      farm.id,
    );

    return {
      ...farm,
      totalAreaHectares: farm.totalAreaHectares.toNumber(),
      arableAreaHectares: farm.arableAreaHectares.toNumber(),
      vegetationAreaHectares: farm.vegetationAreaHectares.toNumber(),
    };
  }

  async count(): Promise<number> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation('count', 'farms');

    const count = await this.prisma.farm.count();

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'count',
      'farms',
      duration,
      `${count} registros`,
    );

    return count;
  }

  async findById(id: string): Promise<Farm | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findById',
      'farms',
      undefined,
      id,
    );

    const farm = await this.prisma.farm.findUnique({
      where: { id },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findById',
      'farms',
      duration,
      farm ? id : 'não encontrada',
    );

    if (!farm) {
      return null;
    }

    return {
      ...farm,
      totalAreaHectares: farm.totalAreaHectares.toNumber(),
      arableAreaHectares: farm.arableAreaHectares.toNumber(),
      vegetationAreaHectares: farm.vegetationAreaHectares.toNumber(),
    };
  }

  async farmsByState(): Promise<IFarmsByState[]> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation('farmsByState', 'farms');

    const farmsByStateResult = await this.prisma.farm.groupBy({
      by: ['state'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'farmsByState',
      'farms',
      duration,
      `${farmsByStateResult.length} estados`,
    );

    return farmsByStateResult.map((item) => ({
      state: item.state,
      count: item._count.id,
    }));
  }

  async totalAreaHectares(): Promise<number> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation('totalAreaHectares', 'farms');

    const totalAreaResult = await this.prisma.farm.aggregate({
      _sum: {
        totalAreaHectares: true,
      },
    });

    const totalArea = Number(totalAreaResult._sum.totalAreaHectares ?? 0);
    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'totalAreaHectares',
      'farms',
      duration,
      `${totalArea} hectares`,
    );

    return totalArea;
  }

  async findFarmsByCrop(): Promise<IFarmsByCrop[]> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation('findFarmsByCrop', 'farms');

    const farmsByCropResult = await this.prisma.planting.groupBy({
      by: ['cropId'],
      _count: {
        farmId: true,
      },
      orderBy: {
        _count: {
          farmId: 'desc',
        },
      },
    });

    const cropIds = farmsByCropResult.map((item) => item.cropId);
    const crops = await this.prisma.crop.findMany({
      where: {
        id: {
          in: cropIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findFarmsByCrop',
      'farms',
      duration,
      `${farmsByCropResult.length} culturas`,
    );

    return farmsByCropResult.map((item) => {
      const crop = crops.find((c) => c.id === item.cropId);
      return {
        cropName: crop?.name ?? 'Cultura desconhecida',
        count: item._count.farmId,
      };
    });
  }

  async landUsage(): Promise<ILandUsage> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation('landUsage', 'farms');

    const landUsageResult = await this.prisma.farm.aggregate({
      _sum: {
        arableAreaHectares: true,
        vegetationAreaHectares: true,
      },
    });

    const result = {
      arableAreaHectares: Number(landUsageResult._sum.arableAreaHectares ?? 0),
      vegetationAreaHectares: Number(
        landUsageResult._sum.vegetationAreaHectares ?? 0,
      ),
    };

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'landUsage',
      'farms',
      duration,
      `${result.arableAreaHectares + result.vegetationAreaHectares} hectares total`,
    );

    return result;
  }
}
