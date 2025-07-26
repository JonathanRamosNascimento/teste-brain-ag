import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { CountFarms } from './abstractions/count.abstraction';

@Injectable()
export class CountFarmsUseCase implements CountFarms {
  constructor(private readonly farmsRepository: FarmsRepository) {}

  async execute(): Promise<number> {
    return await this.farmsRepository.count();
  }
}
