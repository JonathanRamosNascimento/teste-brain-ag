import { CreateCropDto } from '@modules/crop/dto/create-crop.dto';
import { Crop } from '@modules/crop/entities/crop.entity';
import { CropsRepository } from '@modules/crop/repositories/crops.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class PrismaCropsRepository implements CropsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  async create(data: CreateCropDto): Promise<Crop> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'create',
      'crops',
      undefined,
      data.name,
    );

    const crop = await this.prisma.crop.create({
      data,
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'create',
      'crops',
      duration,
      crop.id,
    );

    return crop;
  }

  async findByName(name: string): Promise<Crop | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findByName',
      'crops',
      undefined,
      name,
    );

    const crop = await this.prisma.crop.findUnique({
      where: { name },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findByName',
      'crops',
      duration,
      crop ? name : 'não encontrada',
    );

    return crop;
  }

  async findById(id: string): Promise<Crop | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findById',
      'crops',
      undefined,
      id,
    );

    const crop = await this.prisma.crop.findUnique({
      where: { id },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findById',
      'crops',
      duration,
      crop ? id : 'não encontrada',
    );

    return crop;
  }
}
