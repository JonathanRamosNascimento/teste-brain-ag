import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { CountFarms } from './abstractions/count.abstraction';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class CountFarmsUseCase implements CountFarms {
  constructor(
    private readonly farmsRepository: FarmsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(): Promise<number> {
    this.loggingService.logBusinessLogic(
      'CountFarmsUseCase',
      'Iniciando contagem de fazendas',
      {},
    );

    const count = await this.farmsRepository.count();

    this.loggingService.logBusinessLogic(
      'CountFarmsUseCase',
      'Contagem de fazendas concluída',
      { totalFarms: count },
    );

    return count;
  }
}
