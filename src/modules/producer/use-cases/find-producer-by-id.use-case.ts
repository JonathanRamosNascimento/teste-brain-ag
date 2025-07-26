import { Injectable, NotFoundException } from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';
import { FindProducerById } from './abstractions/find-producer-by-id.abstraction';

@Injectable()
export class FindProducerByIdUseCase implements FindProducerById {
  constructor(private readonly repository: ProducersRepository) {}

  async execute(id: string) {
    const producer = await this.repository.findById(id);

    if (!producer) {
      throw new NotFoundException('Produtor não encontrado');
    }

    return producer;
  }
}
