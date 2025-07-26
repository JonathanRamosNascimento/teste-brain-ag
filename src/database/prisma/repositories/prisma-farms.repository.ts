import { CreateFarmDto } from '@modules/farm/dto/create-farm.dto';
import { Farm } from '@modules/farm/entities/farm.entity';
import { IFarmsByCrop } from '@modules/farm/interfaces/farms-by-crop.interface';
import { IFarmsByState } from '@modules/farm/interfaces/farms-by-state.interface';
import { ILandUsage } from '@modules/farm/interfaces/land-usage.interface';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaFarmsRepository implements FarmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFarmDto): Promise<Farm> {
    const farm = await this.prisma.farm.create({
      data,
    });

    return {
      ...farm,
      totalAreaHectares: farm.totalAreaHectares.toNumber(),
      arableAreaHectares: farm.arableAreaHectares.toNumber(),
      vegetationAreaHectares: farm.vegetationAreaHectares.toNumber(),
    };
  }

  async count(): Promise<number> {
    return this.prisma.farm.count();
  }

  async findById(id: string): Promise<Farm | null> {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
    });

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
    return farmsByStateResult.map((item) => ({
      state: item.state,
      count: item._count.id,
    }));
  }

  async totalAreaHectares(): Promise<number> {
    const totalAreaResult = await this.prisma.farm.aggregate({
      _sum: {
        totalAreaHectares: true,
      },
    });

    return Number(totalAreaResult._sum.totalAreaHectares ?? 0);
  }

  async findFarmsByCrop(): Promise<IFarmsByCrop[]> {
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

    return farmsByCropResult.map((item) => {
      const crop = crops.find((c) => c.id === item.cropId);
      return {
        cropName: crop?.name ?? 'Cultura desconhecida',
        count: item._count.farmId,
      };
    });
  }

  async landUsage(): Promise<ILandUsage> {
    const landUsageResult = await this.prisma.farm.aggregate({
      _sum: {
        arableAreaHectares: true,
        vegetationAreaHectares: true,
      },
    });

    return {
      arableAreaHectares: Number(landUsageResult._sum.arableAreaHectares ?? 0),
      vegetationAreaHectares: Number(
        landUsageResult._sum.vegetationAreaHectares ?? 0,
      ),
    };
  }
}
