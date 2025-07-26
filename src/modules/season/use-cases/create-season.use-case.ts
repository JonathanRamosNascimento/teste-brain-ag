import { ConflictException, Injectable } from '@nestjs/common';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { Season } from '../entities/season.entity';

@Injectable()
export class CreateSeasonUseCase {
  constructor(private readonly seasonsRepository: SeasonsRepository) {}

  async execute(createSeasonDto: CreateSeasonDto): Promise<Season> {
    const season = await this.seasonsRepository.findByNameAndYear(
      createSeasonDto.name,
      createSeasonDto.year,
    );

    if (season) {
      throw new ConflictException('Safras com o mesmo nome e ano já existem');
    }

    return await this.seasonsRepository.create(createSeasonDto);
  }
}
