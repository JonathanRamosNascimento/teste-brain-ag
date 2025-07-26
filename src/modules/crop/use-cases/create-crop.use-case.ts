import { ConflictException, Injectable } from '@nestjs/common';
import { CropsRepository } from '../repositories/crops.repository';
import { CreateCropDto } from '../dto/create-crop.dto';
import { Crop } from '../entities/crop.entity';

@Injectable()
export class CreateCropUseCase {
  constructor(private readonly repository: CropsRepository) {}

  async execute(data: CreateCropDto): Promise<Crop> {
    const crop = await this.repository.findByName(data.name);

    if (crop) {
      throw new ConflictException('Cultura já cadastrada');
    }

    return await this.repository.create(data);
  }
}
