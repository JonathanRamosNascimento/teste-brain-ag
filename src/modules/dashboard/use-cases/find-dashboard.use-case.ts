import { CountFarms } from '@modules/farm/use-cases/abstractions/count.abstraction';
import { FarmsByState } from '@modules/farm/use-cases/abstractions/farms-by-state.abstraction';
import { FindFarmsByCrop } from '@modules/farm/use-cases/abstractions/find-farms-by-crop.abstraction';
import { LandUsage } from '@modules/farm/use-cases/abstractions/land-usage.abstraction';
import { TotalAreaHectares } from '@modules/farm/use-cases/abstractions/total-area-hectares.abstraction';
import { Injectable } from '@nestjs/common';
import { Dashboard } from '../entities/dashboard.entity';

@Injectable()
export class FindDashboardUseCase {
  constructor(
    private readonly countFarms: CountFarms,
    private readonly farmsByState: FarmsByState,
    private readonly findFarmsByCrop: FindFarmsByCrop,
    private readonly landUsage: LandUsage,
    private readonly totalAreaHectares: TotalAreaHectares,
  ) {}

  async execute(): Promise<Dashboard> {
    return {
      totalFarms: await this.countFarms.execute(),
      totalHectares: await this.totalAreaHectares.execute(),
      farmsByState: await this.farmsByState.execute(),
      farmsByCrop: await this.findFarmsByCrop.execute(),
      landUsage: await this.landUsage.execute(),
    };
  }
}
