import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';

@Injectable()
export class CountFarmsUseCase {
  constructor(private readonly farmsRepository: FarmsRepository) {}

  async execute(): Promise<number> {
    return await this.farmsRepository.count();
  }
}
