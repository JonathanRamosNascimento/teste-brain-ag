import { CreateCropDto } from '@modules/crop/dto/create-crop.dto';
import { Crop } from '@modules/crop/entities/crop.entity';
import { CropsRepository } from '@modules/crop/repositories/crops.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCropsRepository implements CropsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCropDto): Promise<Crop> {
    return this.prisma.crop.create({
      data,
    });
  }

  async findByName(name: string): Promise<Crop | null> {
    return this.prisma.crop.findUnique({
      where: { name },
    });
  }

  async findById(id: string): Promise<Crop | null> {
    return this.prisma.crop.findUnique({
      where: { id },
    });
  }
}
