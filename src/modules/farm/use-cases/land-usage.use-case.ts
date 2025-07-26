import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { LandUsage } from './abstractions/land-usage.abstraction';

@Injectable()
export class LandUsageUseCase implements LandUsage {
  constructor(private readonly repository: FarmsRepository) {}

  async execute(): Promise<{
    arableAreaHectares: number;
    vegetationAreaHectares: number;
  }> {
    return await this.repository.landUsage();
  }
}
