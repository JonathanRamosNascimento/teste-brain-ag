import { Season } from '@modules/season/entities/season.entity';
import { CreateSeasonDto } from '../dto/create-season.dto';

export abstract class SeasonsRepository {
  abstract create(data: CreateSeasonDto): Promise<Season>;
  abstract findById(id: string): Promise<Season | null>;
  abstract findByNameAndYear(
    name: string,
    year: number,
  ): Promise<Season | null>;
}
