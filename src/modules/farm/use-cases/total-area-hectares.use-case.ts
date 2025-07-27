import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { TotalAreaHectares } from './abstractions/total-area-hectares.abstraction';
import { LoggingService } from '@logging/logging.service';

@Injectable()
export class TotalAreaHectaresUseCase implements TotalAreaHectares {
  constructor(
    private readonly repository: FarmsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(): Promise<number> {
    this.loggingService.logBusinessLogic(
      'TotalAreaHectaresUseCase',
      'Iniciando cálculo da área total em hectares',
      {},
    );

    const totalArea = await this.repository.totalAreaHectares();

    this.loggingService.logBusinessLogic(
      'TotalAreaHectaresUseCase',
      'Cálculo da área total concluído',
      { totalAreaHectares: totalArea },
    );

    return totalArea;
  }
}
