import { Injectable, NotFoundException } from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class DeleteProducerUseCase {
  constructor(
    private readonly repository: ProducersRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(id: string): Promise<void> {
    this.loggingService.logBusinessLogic(
      'DeleteProducerUseCase',
      'Iniciando exclusão de produtor',
      { producerId: id },
    );

    const producer = await this.repository.findById(id);

    if (!producer) {
      this.loggingService.logBusinessLogic(
        'DeleteProducerUseCase',
        'Tentativa de excluir produtor inexistente',
        { producerId: id },
      );
      throw new NotFoundException('Produtor não encontrado');
    }

    this.loggingService.logBusinessLogic(
      'DeleteProducerUseCase',
      'Produtor encontrado - prosseguindo com exclusão',
      {
        producerId: producer.id,
        producerName: producer.name,
        producerCpfCnpj: producer.cpfCnpj,
      },
    );

    await this.repository.delete(id);

    this.loggingService.logBusinessLogic(
      'DeleteProducerUseCase',
      'Produtor excluído com sucesso',
      {
        producerId: id,
        deletedProducerName: producer.name,
        deletedProducerCpfCnpj: producer.cpfCnpj,
      },
    );
  }
}
