import { Planting } from '@modules/planting/entities/planting.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Crop {
  @ApiProperty({
    description: 'ID da cultura',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da cultura',
    example: 'Soja',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da cultura',
    example: 'Cultivada em regiões tropicais',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Categoria da cultura',
    example: 'Grãos',
    required: false,
  })
  category?: string | null;

  @ApiProperty({
    description: 'Plantas na cultura',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Planta 1',
        description: 'Descrição da planta 1',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ],
  })
  plantings?: Planting[];
}
