import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { Injectable } from '@nestjs/common';
import { IFarmsByState } from '../interfaces/farms-by-state.interface';
import { FarmsByState } from './abstractions/farms-by-state.abstraction';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class FarmsByStateUseCase implements FarmsByState {
  constructor(
    private readonly repository: FarmsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(): Promise<IFarmsByState[]> {
    this.loggingService.logBusinessLogic(
      'FarmsByStateUseCase',
      'Iniciando busca de fazendas por estado',
      {},
    );

    const farmsByState = await this.repository.farmsByState();

    this.loggingService.logBusinessLogic(
      'FarmsByStateUseCase',
      'Busca de fazendas por estado concluída',
      { totalStates: farmsByState.length },
    );

    return farmsByState as IFarmsByState[];
  }
}
