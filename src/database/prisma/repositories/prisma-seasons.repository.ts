import { Injectable } from '@nestjs/common';
import { SeasonsRepository } from '@modules/season/repositories/seasons.repository';
import { PrismaService } from '../prisma.service';
import { CreateSeasonDto } from '@modules/season/dto/create-season.dto';
import { Season } from '@modules/season/entities/season.entity';

@Injectable()
export class PrismaSeasonsRepository implements SeasonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSeasonDto): Promise<Season> {
    return this.prisma.season.create({
      data,
    });
  }

  async findById(id: string): Promise<Season | null> {
    return this.prisma.season.findUnique({
      where: {
        id,
      },
    });
  }

  async findByNameAndYear(name: string, year: number): Promise<Season | null> {
    return this.prisma.season.findUnique({
      where: {
        name_year: {
          name,
          year,
        },
      },
    });
  }
}
