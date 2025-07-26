import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProducerDto } from '../dto/create-producer.dto';
import { Producer } from '../entities/producer.entity';
import { ProducersRepository } from '../repositories/producers.repository';
import { ValidationsDocuments } from '../validators/validations-documents';

@Injectable()
export class CreateProducerUseCase {
  constructor(
    private readonly repository: ProducersRepository,
    private readonly validations: ValidationsDocuments,
  ) {}

  async execute(data: CreateProducerDto): Promise<Producer> {
    if (!this.validations.isValidDocument(data.cpfCnpj)) {
      throw new ConflictException('Formato de documento inválido');
    }

    const existingProducer = await this.repository.findByCpfCnpj(data.cpfCnpj);

    if (existingProducer) {
      throw new ConflictException('Já existe um produtor com este documento');
    }

    const producer = await this.repository.create(data);

    return producer;
  }
}
