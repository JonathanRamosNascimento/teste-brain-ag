import { Injectable } from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class FindAllProducersUseCase {
  constructor(
    private readonly repository: ProducersRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(): Promise<Producer[]> {
    this.loggingService.logBusinessLogic(
      'FindAllProducersUseCase',
      'Iniciando busca de todos os produtores',
      {},
    );

    const producers = await this.repository.findAll();

    this.loggingService.logBusinessLogic(
      'FindAllProducersUseCase',
      'Busca de produtores concluída',
      { totalProducers: producers.length },
    );

    return producers;
  }
}
