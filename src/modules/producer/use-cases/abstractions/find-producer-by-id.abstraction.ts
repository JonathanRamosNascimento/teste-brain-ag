import { Producer } from '@modules/producer/entities/producer.entity';

export abstract class FindProducerById {
  abstract execute(id: string): Promise<Producer>;
}
