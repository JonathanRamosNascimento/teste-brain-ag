import { Injectable } from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';

@Injectable()
export class FindAllProducersUseCase {
  constructor(private readonly repository: ProducersRepository) {}

  async execute(): Promise<Producer[]> {
    return await this.repository.findAll();
  }
}
