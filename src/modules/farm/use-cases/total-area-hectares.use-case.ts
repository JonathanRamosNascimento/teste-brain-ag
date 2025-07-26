import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { TotalAreaHectares } from './abstractions/total-area-hectares.abstraction';

@Injectable()
export class TotalAreaHectaresUseCase implements TotalAreaHectares {
  constructor(private readonly repository: FarmsRepository) {}

  async execute(): Promise<number> {
    return await this.repository.totalAreaHectares();
  }
}
