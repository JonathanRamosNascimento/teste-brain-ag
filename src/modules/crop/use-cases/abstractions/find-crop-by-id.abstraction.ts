import { Crop } from '@modules/crop/entities/crop.entity';

export abstract class FindCropById {
  abstract execute(id: string): Promise<Crop>;
}
