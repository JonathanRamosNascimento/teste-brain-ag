import { Injectable, NotFoundException } from '@nestjs/common';
import { Crop } from '../entities/crop.entity';
import { CropsRepository } from '../repositories/crops.repository';
import { FindCropById } from './abstractions/find-crop-by-id.abstraction';

@Injectable()
export class FindCropByIdUseCase implements FindCropById {
  constructor(private readonly repository: CropsRepository) {}

  async execute(id: string): Promise<Crop> {
    const crop = await this.repository.findById(id);

    if (!crop) {
      throw new NotFoundException('Cultura não encontrada');
    }

    return crop;
  }
}
