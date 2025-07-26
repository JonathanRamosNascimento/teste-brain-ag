import { ConflictException, Injectable } from '@nestjs/common';
import { FarmsRepository } from '../repositories/farms.repository';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { Farm } from '../entities/farm.entity';
import { FindProducerById } from '@modules/producer/use-cases/abstractions/find-producer-by-id.abstraction';
import { ValidationArea } from '../validators/validation-area';

@Injectable()
export class CreateFarmUseCase {
  constructor(
    private readonly repository: FarmsRepository,
    private readonly validations: ValidationArea,
    private readonly findProducerById: FindProducerById,
  ) {}

  async execute(data: CreateFarmDto): Promise<Farm> {
    await this.findProducerById.execute(data.producerId);

    if (
      !this.validations.validFarmAreas(
        data.totalAreaHectares,
        data.arableAreaHectares,
        data.vegetationAreaHectares,
      )
    ) {
      throw new ConflictException('Áreas da fazenda inválidas');
    }

    return await this.repository.create(data);
  }
}
