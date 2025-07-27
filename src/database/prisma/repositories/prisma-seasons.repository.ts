import { Injectable } from '@nestjs/common';
import { SeasonsRepository } from '@modules/season/repositories/seasons.repository';
import { PrismaService } from '../prisma.service';
import { CreateSeasonDto } from '@modules/season/dto/create-season.dto';
import { Season } from '@modules/season/entities/season.entity';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class PrismaSeasonsRepository implements SeasonsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  async create(data: CreateSeasonDto): Promise<Season> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'create',
      'seasons',
      undefined,
      `${data.name}-${data.year}`,
    );

    const season = await this.prisma.season.create({
      data,
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'create',
      'seasons',
      duration,
      season.id,
    );

    return season;
  }

  async findById(id: string): Promise<Season | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findById',
      'seasons',
      undefined,
      id,
    );

    const season = await this.prisma.season.findUnique({
      where: {
        id,
      },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findById',
      'seasons',
      duration,
      season ? id : 'não encontrada',
    );

    return season;
  }

  async findByNameAndYear(name: string, year: number): Promise<Season | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findByNameAndYear',
      'seasons',
      undefined,
      `${name}-${year}`,
    );

    const season = await this.prisma.season.findUnique({
      where: {
        name_year: {
          name,
          year,
        },
      },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findByNameAndYear',
      'seasons',
      duration,
      season ? 'encontrada' : 'não encontrada',
    );

    return season;
  }
}
