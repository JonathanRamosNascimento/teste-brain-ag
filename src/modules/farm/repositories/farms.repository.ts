import { CreateFarmDto } from '../dto/create-farm.dto';
import { Farm } from '../entities/farm.entity';

export abstract class FarmsRepository {
  abstract create(data: CreateFarmDto): Promise<Farm>;
  abstract count(): Promise<number>;
  abstract findById(id: string): Promise<Farm | null>;
}
