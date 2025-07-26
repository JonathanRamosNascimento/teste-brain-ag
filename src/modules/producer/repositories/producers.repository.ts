import { Producer } from '@prisma/client';
import { CreateProducerDto } from '../dto/create-producer.dto';
import { UpdateProducerDto } from '../dto/update-producer.dto';

export abstract class ProducersRepository {
  abstract create(data: CreateProducerDto): Promise<Producer>;
  abstract findAll(): Promise<Producer[]>;
  abstract findById(id: string): Promise<Producer | null>;
  abstract findByCpfCnpj(cpfCnpj: string): Promise<Producer | null>;
  abstract update(data: UpdateProducerDto): Promise<Producer>;
  abstract delete(id: string): Promise<void>;
}
