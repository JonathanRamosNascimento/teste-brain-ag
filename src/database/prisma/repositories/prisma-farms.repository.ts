import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { PrismaService } from '../prisma.service';
import { CreateFarmDto } from '@modules/farm/dto/create-farm.dto';
import { Farm } from '@modules/farm/entities/farm.entity';

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
}
