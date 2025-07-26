import { Planting } from '@modules/planting/entities/planting.entity';
import { Producer } from '@modules/producer/entities/producer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Farm {
  @ApiProperty({
    description: 'ID da fazenda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da fazenda',
    example: 'Fazenda Santa Maria',
  })
  name: string;

  @ApiProperty({
    description: 'Cidade da fazenda',
    example: 'São Paulo',
  })
  city: string;

  @ApiProperty({
    description: 'Estado da fazenda',
    example: 'SP',
  })
  state: string;

  @ApiProperty({
    description: 'Área total da fazenda em hectares',
    example: 1000.5,
  })
  totalAreaHectares: number;

  @ApiProperty({
    description: 'Área agricultável da fazenda em hectares',
    example: 800.25,
  })
  arableAreaHectares: number;

  @ApiProperty({
    description: 'Área de vegetação da fazenda em hectares',
    example: 200.25,
  })
  vegetationAreaHectares: number;

  @ApiProperty({
    description: 'Data de criação da fazenda',
    example: '2025-01-01',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Data de atualização da fazenda',
    example: '2025-01-01',
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Produtor proprietário da fazenda',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'João Silva',
      cpfCnpj: '12345678901',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
  })
  producer?: Producer;

  @ApiProperty({
    description: 'ID do produtor proprietário da fazenda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  producerId: string;

  @ApiProperty({
    description: 'Plantas na fazenda',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Plantio 1',
        description: 'Descrição do plantio 1',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ],
  })
  plantings?: Planting[];
}
