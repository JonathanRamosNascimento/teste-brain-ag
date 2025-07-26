import { Planting } from '@modules/planting/entities/planting.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Season {
  @ApiProperty({
    description: 'ID da safra',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da safra',
    example: '2024',
  })
  name: string;

  @ApiProperty({
    description: 'Ano da safra',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Data de início da safra',
    example: '2024-01-01',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Data de fim da safra',
    example: '2024-01-01',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Se a safra está ativa',
    example: true,
    default: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Plantios da safra',
    type: [Planting],
    required: false,
  })
  plantings?: Planting[];
}
