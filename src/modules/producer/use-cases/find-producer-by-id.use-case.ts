import { Injectable, NotFoundException } from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';
import { FindProducerById } from './abstractions/find-producer-by-id.abstraction';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class FindProducerByIdUseCase implements FindProducerById {
  constructor(
    private readonly repository: ProducersRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(id: string) {
    this.loggingService.logBusinessLogic(
      'FindProducerByIdUseCase',
      'Iniciando busca de produtor por ID',
      { producerId: id },
    );

    const producer = await this.repository.findById(id);

    if (!producer) {
      this.loggingService.logBusinessLogic(
        'FindProducerByIdUseCase',
        'Produtor não encontrado',
        { producerId: id },
      );
      throw new NotFoundException('Produtor não encontrado');
    }

    this.loggingService.logBusinessLogic(
      'FindProducerByIdUseCase',
      'Produtor encontrado com sucesso',
      {
        producerId: producer.id,
        producerName: producer.name,
        producerCpfCnpj: producer.cpfCnpj,
      },
    );

    return producer;
  }
}
