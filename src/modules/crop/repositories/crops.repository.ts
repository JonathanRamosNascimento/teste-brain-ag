import { CreateCropDto } from '../dto/create-crop.dto';
import { Crop } from '../entities/crop.entity';

export abstract class CropsRepository {
  abstract create(data: CreateCropDto): Promise<Crop>;
  abstract findByName(name: string): Promise<Crop | null>;
  abstract findById(id: string): Promise<Crop | null>;
}
