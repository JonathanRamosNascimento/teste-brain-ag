import { Season } from '@modules/season/entities/season.entity';

export abstract class FindSeasonById {
  abstract execute(id: string): Promise<Season>;
}
