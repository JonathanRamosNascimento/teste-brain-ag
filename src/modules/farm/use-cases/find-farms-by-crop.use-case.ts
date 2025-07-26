import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { FindFarmsByCrop } from './abstractions/find-farms-by-crop.abstraction';

@Injectable()
export class FindFarmsByCropUseCase implements FindFarmsByCrop {
  constructor(private readonly repository: FarmsRepository) {}

  async execute(): Promise<{ cropName: string; count: number }[]> {
    return await this.repository.findFarmsByCrop();
  }
}
