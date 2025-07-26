import { Injectable, NotFoundException } from '@nestjs/common';
import { FindFarmById } from './abstractions/find-farm-by-id.abstraction';
import { FarmsRepository } from '../repositories/farms.repository';
import { Farm } from '../entities/farm.entity';

@Injectable()
export class FindFarmByIdUseCase implements FindFarmById {
  constructor(private readonly repository: FarmsRepository) {}

  async execute(id: string): Promise<Farm> {
    const farm = await this.repository.findById(id);

    if (!farm) {
      throw new NotFoundException('Fazenda não encontrada');
    }

    return farm;
  }
}
