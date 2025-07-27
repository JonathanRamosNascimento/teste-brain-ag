import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';
import { UpdateProducerDto } from '../dto/update-producer.dto';
import { Producer } from '../entities/producer.entity';
import { ValidationsDocuments } from '../validators/validations-documents';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class UpdateProducerUseCase {
  constructor(
    private readonly repository: ProducersRepository,
    private readonly validations: ValidationsDocuments,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(data: UpdateProducerDto): Promise<Producer> {
    this.loggingService.logBusinessLogic(
      'UpdateProducerUseCase',
      'Iniciando atualização de produtor',
      {
        producerId: data.id,
        updateData: { name: data.name, cpfCnpj: data.cpfCnpj },
      },
    );

    const producer = await this.repository.findById(data.id);

    if (!producer) {
      this.loggingService.logBusinessLogic(
        'UpdateProducerUseCase',
        'Tentativa de atualizar produtor inexistente',
        { producerId: data.id },
      );
      throw new NotFoundException('Produtor não encontrado');
    }

    this.loggingService.logBusinessLogic(
      'UpdateProducerUseCase',
      'Produtor encontrado para atualização',
      {
        producerId: data.id,
        currentName: producer.name,
        currentCpfCnpj: producer.cpfCnpj,
      },
    );

    if (data.cpfCnpj) {
      this.loggingService.logBusinessLogic(
        'UpdateProducerUseCase',
        'Validando novo documento',
        { producerId: data.id, newCpfCnpj: data.cpfCnpj },
      );

      const validate = this.validations.isValidDocument(data.cpfCnpj);

      if (!validate) {
        this.loggingService.logValidationError(
          'cpfCnpj',
          data.cpfCnpj,
          'Formato de documento inválido',
        );
        throw new ConflictException('Formato de documento inválido');
      }

      this.loggingService.logBusinessLogic(
        'UpdateProducerUseCase',
        'Documento validado com sucesso - verificando duplicidade',
        { producerId: data.id, cpfCnpj: data.cpfCnpj },
      );

      const existingProducer = await this.repository.findByCpfCnpj(
        data.cpfCnpj,
      );

      if (existingProducer && existingProducer.id !== data.id) {
        this.loggingService.logBusinessLogic(
          'UpdateProducerUseCase',
          'Tentativa de atualizar com documento duplicado',
          {
            producerId: data.id,
            cpfCnpj: data.cpfCnpj,
            existingProducerId: existingProducer.id,
          },
        );
        throw new ConflictException('Já existe um produtor com este documento');
      }

      this.loggingService.logBusinessLogic(
        'UpdateProducerUseCase',
        'Verificação de duplicidade concluída - atualizando produtor',
        { producerId: data.id, cpfCnpj: data.cpfCnpj },
      );
    } else {
      this.loggingService.logBusinessLogic(
        'UpdateProducerUseCase',
        'Atualizando produtor sem alteração de documento',
        { producerId: data.id },
      );
    }

    const updatedProducer = await this.repository.update(data);

    this.loggingService.logBusinessLogic(
      'UpdateProducerUseCase',
      'Produtor atualizado com sucesso',
      {
        producerId: updatedProducer.id,
        updatedName: updatedProducer.name,
        updatedCpfCnpj: updatedProducer.cpfCnpj,
      },
    );

    return updatedProducer;
  }
}
