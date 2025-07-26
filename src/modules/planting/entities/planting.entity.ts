import { Farm } from '@modules/farm/entities/farm.entity';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Season } from '@modules/season/entities/season.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Planting {
  @ApiProperty({
    description: 'ID da plantação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Área plantada em hectares',
    example: 100,
  })
  plantedAreaHectares: number;

  @ApiProperty({
    description: 'Data de plantio',
    example: '2021-01-01',
    required: false,
  })
  plantingDate?: Date | null;

  @ApiProperty({
    description: 'Data de colheita esperada',
    example: '2021-01-01',
    required: false,
  })
  expectedHarvestDate?: Date | null;

  @ApiProperty({
    description: 'Notas da plantação',
    example: 'Plantação de soja',
    required: false,
  })
  notes?: string | null;

  @ApiProperty({
    description: 'Fazenda',
    type: Farm,
    required: false,
  })
  farm?: Farm | null;

  @ApiProperty({
    description: 'ID da fazenda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  farmId: string;

  @ApiProperty({
    description: 'Safra',
    type: Season,
    required: false,
  })
  season?: Season | null;

  @ApiProperty({
    description: 'ID da safra',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  seasonId: string;

  @ApiProperty({
    description: 'Cultura',
    type: Crop,
    required: false,
  })
  crop?: Crop | null;

  @ApiProperty({
    description: 'ID da cultura',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cropId: string;
}
