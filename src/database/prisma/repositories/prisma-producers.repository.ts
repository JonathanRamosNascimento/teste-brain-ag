import { Producer } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateProducerDto } from '@modules/producer/dto/create-producer.dto';
import { UpdateProducerDto } from '@modules/producer/dto/update-producer.dto';
import { ProducersRepository } from '@modules/producer/repositories/producers.repository';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class PrismaProducersRepository implements ProducersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  async findAll(): Promise<Producer[]> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation('findAll', 'producers');

    const producers = await this.prisma.producer.findMany({
      include: {
        farms: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            totalAreaHectares: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findAll',
      'producers',
      duration,
      `${producers.length} registros`,
    );

    return producers;
  }

  async findById(id: string): Promise<Producer | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findById',
      'producers',
      undefined,
      id,
    );

    const producer = await this.prisma.producer.findUnique({
      where: { id },
      include: {
        farms: {
          include: {
            plantings: {
              include: {
                crop: true,
                season: true,
              },
            },
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findById',
      'producers',
      duration,
      producer ? id : 'não encontrado',
    );

    return producer;
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<Producer | null> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'findByCpfCnpj',
      'producers',
      undefined,
      cpfCnpj,
    );

    const producer = await this.prisma.producer.findUnique({
      where: { cpfCnpj },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'findByCpfCnpj',
      'producers',
      duration,
      producer ? 'encontrado' : 'não encontrado',
    );

    return producer;
  }

  async create(data: CreateProducerDto): Promise<Producer> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'create',
      'producers',
      undefined,
      data.cpfCnpj,
    );

    const producer = await this.prisma.producer.create({
      data,
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'create',
      'producers',
      duration,
      producer.id,
    );

    return producer;
  }

  async update(data: UpdateProducerDto): Promise<Producer> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'update',
      'producers',
      undefined,
      data.id,
    );

    const producer = await this.prisma.producer.update({
      where: { id: data.id },
      data,
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'update',
      'producers',
      duration,
      producer.id,
    );

    return producer;
  }

  async delete(id: string): Promise<void> {
    const startTime = Date.now();
    this.loggingService.logDatabaseOperation(
      'delete',
      'producers',
      undefined,
      id,
    );

    await this.prisma.producer.delete({
      where: { id },
    });

    const duration = Date.now() - startTime;
    this.loggingService.logDatabaseOperation(
      'delete',
      'producers',
      duration,
      id,
    );
  }
}
