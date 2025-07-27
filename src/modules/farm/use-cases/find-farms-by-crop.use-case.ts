import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../../logging/logging.service';
import { IFarmsByCrop } from '../interfaces/farms-by-crop.interface';
import { FindFarmsByCrop } from './abstractions/find-farms-by-crop.abstraction';

@Injectable()
export class FindFarmsByCropUseCase implements FindFarmsByCrop {
  constructor(
    private readonly repository: FarmsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(): Promise<IFarmsByCrop[]> {
    this.loggingService.logBusinessLogic(
      'FindFarmsByCropUseCase',
      'Iniciando busca de fazendas por cultura',
      {},
    );

    const farmsByCrop = await this.repository.findFarmsByCrop();

    this.loggingService.logBusinessLogic(
      'FindFarmsByCropUseCase',
      'Busca de fazendas por cultura concluída',
      {
        totalCrops: farmsByCrop.length,
        totalFarms: farmsByCrop.reduce(
          (sum, item) => Number(sum + item.count),
          0,
        ),
      },
    );

    return farmsByCrop as IFarmsByCrop[];
  }
}
