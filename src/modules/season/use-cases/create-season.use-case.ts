import { ConflictException, Injectable } from '@nestjs/common';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { Season } from '../entities/season.entity';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class CreateSeasonUseCase {
  constructor(
    private readonly seasonsRepository: SeasonsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(createSeasonDto: CreateSeasonDto): Promise<Season> {
    this.loggingService.logBusinessLogic(
      'CreateSeasonUseCase',
      'Iniciando criação de safra',
      { name: createSeasonDto.name, year: createSeasonDto.year },
    );

    const season = await this.seasonsRepository.findByNameAndYear(
      createSeasonDto.name,
      createSeasonDto.year,
    );

    if (season) {
      this.loggingService.logBusinessLogic(
        'CreateSeasonUseCase',
        'Tentativa de criar safra com nome e ano duplicados',
        {
          name: createSeasonDto.name,
          year: createSeasonDto.year,
          existingSeasonId: season.id,
        },
      );
      throw new ConflictException('Safras com o mesmo nome e ano já existem');
    }

    this.loggingService.logBusinessLogic(
      'CreateSeasonUseCase',
      'Verificação de duplicidade concluída - criando safra',
      { name: createSeasonDto.name, year: createSeasonDto.year },
    );

    const createdSeason = await this.seasonsRepository.create(createSeasonDto);

    this.loggingService.logBusinessLogic(
      'CreateSeasonUseCase',
      'Safra criada com sucesso',
      {
        seasonId: createdSeason.id,
        name: createdSeason.name,
        year: createdSeason.year,
      },
    );

    return createdSeason;
  }
}
