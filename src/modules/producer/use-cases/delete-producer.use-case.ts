import { Injectable, NotFoundException } from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';

@Injectable()
export class DeleteProducerUseCase {
  constructor(private readonly repository: ProducersRepository) {}

  async execute(id: string): Promise<void> {
    const producer = await this.repository.findById(id);

    if (!producer) {
      throw new NotFoundException('Produtor não encontrado');
    }

    await this.repository.delete(id);
  }
}
