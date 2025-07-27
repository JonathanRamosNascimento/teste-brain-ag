import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProducerDto } from '../dto/create-producer.dto';
import { Producer } from '../entities/producer.entity';
import { ProducersRepository } from '../repositories/producers.repository';
import { ValidationsDocuments } from '../validators/validations-documents';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class CreateProducerUseCase {
  constructor(
    private readonly repository: ProducersRepository,
    private readonly validations: ValidationsDocuments,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(data: CreateProducerDto): Promise<Producer> {
    this.loggingService.logBusinessLogic(
      'CreateProducerUseCase',
      'Iniciando criação de produtor',
      { cpfCnpj: data.cpfCnpj, name: data.name },
    );

    if (!this.validations.isValidDocument(data.cpfCnpj)) {
      this.loggingService.logValidationError(
        'cpfCnpj',
        data.cpfCnpj,
        'Formato de documento inválido',
      );
      throw new ConflictException('Formato de documento inválido');
    }

    this.loggingService.logBusinessLogic(
      'CreateProducerUseCase',
      'Documento validado com sucesso',
      { cpfCnpj: data.cpfCnpj },
    );

    const existingProducer = await this.repository.findByCpfCnpj(data.cpfCnpj);

    if (existingProducer) {
      this.loggingService.logBusinessLogic(
        'CreateProducerUseCase',
        'Tentativa de criar produtor com documento duplicado',
        { cpfCnpj: data.cpfCnpj, existingProducerId: existingProducer.id },
      );
      throw new ConflictException('Já existe um produtor com este documento');
    }

    this.loggingService.logBusinessLogic(
      'CreateProducerUseCase',
      'Verificação de duplicidade concluída - criando produtor',
      { cpfCnpj: data.cpfCnpj },
    );

    const producer = await this.repository.create(data);

    this.loggingService.logBusinessLogic(
      'CreateProducerUseCase',
      'Produtor criado com sucesso',
      {
        producerId: producer.id,
        cpfCnpj: producer.cpfCnpj,
        name: producer.name,
      },
    );

    return producer;
  }
}
