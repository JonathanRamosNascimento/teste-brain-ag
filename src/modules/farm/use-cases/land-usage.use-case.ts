import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../logging/logging.service';
import { ILandUsage } from '../interfaces/land-usage.interface';
import { LandUsage } from './abstractions/land-usage.abstraction';

@Injectable()
export class LandUsageUseCase implements LandUsage {
  constructor(
    private readonly repository: FarmsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(): Promise<ILandUsage> {
    this.loggingService.logBusinessLogic(
      'LandUsageUseCase',
      'Iniciando cálculo de uso da terra',
      {},
    );

    const landUsage = await this.repository.landUsage();

    this.loggingService.logBusinessLogic(
      'LandUsageUseCase',
      'Cálculo de uso da terra concluído',
      {
        arableAreaHectares: landUsage.arableAreaHectares,
        vegetationAreaHectares: landUsage.vegetationAreaHectares,
        totalUsedArea:
          landUsage.arableAreaHectares + landUsage.vegetationAreaHectares,
      },
    );

    return landUsage as ILandUsage;
  }
}
