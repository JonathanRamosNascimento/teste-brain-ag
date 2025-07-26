import { Injectable, NotFoundException } from '@nestjs/common';
import { Season } from '../entities/season.entity';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { FindSeasonById } from './abstractions/find-season-by-id.abstraction';

@Injectable()
export class FindSeasonByIdUseCase implements FindSeasonById {
  constructor(private readonly repository: SeasonsRepository) {}

  async execute(id: string): Promise<Season> {
    const season = await this.repository.findById(id);

    if (!season) {
      throw new NotFoundException('Safra não encontrada');
    }

    return season;
  }
}
