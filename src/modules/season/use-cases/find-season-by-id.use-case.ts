import { Injectable, NotFoundException } from '@nestjs/common';
import { Season } from '../entities/season.entity';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { FindSeasonById } from './abstractions/find-season-by-id.abstraction';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class FindSeasonByIdUseCase implements FindSeasonById {
  constructor(
    private readonly repository: SeasonsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(id: string): Promise<Season> {
    this.loggingService.logBusinessLogic(
      'FindSeasonByIdUseCase',
      'Iniciando busca de safra por ID',
      { seasonId: id },
    );

    const season = await this.repository.findById(id);

    if (!season) {
      this.loggingService.logBusinessLogic(
        'FindSeasonByIdUseCase',
        'Safra não encontrada',
        { seasonId: id },
      );
      throw new NotFoundException('Safra não encontrada');
    }

    this.loggingService.logBusinessLogic(
      'FindSeasonByIdUseCase',
      'Safra encontrada com sucesso',
      {
        seasonId: season.id,
        seasonName: season.name,
        seasonYear: season.year,
      },
    );

    return season;
  }
}
