import { Producer } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateProducerDto } from '@modules/producer/dto/create-producer.dto';
import { UpdateProducerDto } from '@modules/producer/dto/update-producer.dto';
import { ProducersRepository } from '@modules/producer/repositories/producers.repository';

@Injectable()
export class PrismaProducersRepository implements ProducersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Producer[]> {
    return this.prisma.producer.findMany({
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
  }

  async findById(id: string): Promise<Producer | null> {
    return this.prisma.producer.findUnique({
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
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<Producer | null> {
    return this.prisma.producer.findUnique({
      where: { cpfCnpj },
    });
  }

  async create(data: CreateProducerDto): Promise<Producer> {
    return this.prisma.producer.create({
      data,
    });
  }

  async update(data: UpdateProducerDto): Promise<Producer> {
    return this.prisma.producer.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.producer.delete({
      where: { id },
    });
  }
}
