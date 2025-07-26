import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { Injectable } from '@nestjs/common';
import { IFarmsByState } from '../interfaces/farms-by-state.interface';
import { FarmsByState } from './abstractions/farms-by-state.abstraction';

@Injectable()
export class FarmsByStateUseCase implements FarmsByState {
  constructor(private readonly repository: FarmsRepository) {}

  async execute(): Promise<IFarmsByState[]> {
    return await this.repository.farmsByState();
  }
}
