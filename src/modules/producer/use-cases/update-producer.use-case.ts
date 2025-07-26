import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProducersRepository } from '../repositories/producers.repository';
import { UpdateProducerDto } from '../dto/update-producer.dto';
import { Producer } from '../entities/producer.entity';
import { ValidationsDocuments } from '../validators/validations-documents';

@Injectable()
export class UpdateProducerUseCase {
  constructor(
    private readonly repository: ProducersRepository,
    private readonly validations: ValidationsDocuments,
  ) {}

  async execute(data: UpdateProducerDto): Promise<Producer> {
    const producer = await this.repository.findById(data.id);

    if (!producer) {
      throw new NotFoundException('Produtor não encontrado');
    }

    if (data.cpfCnpj) {
      const validate = this.validations.isValidDocument(data.cpfCnpj);

      if (!validate) {
        throw new ConflictException('Formato de documento inválido');
      }

      const existingProducer = await this.repository.findByCpfCnpj(
        data.cpfCnpj,
      );

      if (existingProducer) {
        throw new ConflictException('Já existe um produtor com este documento');
      }
    }

    const updatedProducer = await this.repository.update(data);

    return updatedProducer;
  }
}
