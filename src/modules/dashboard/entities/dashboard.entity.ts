import { ApiProperty } from '@nestjs/swagger';

class LandUsage {
  @ApiProperty({
    description: 'Área arável',
    example: 35000.2,
  })
  arableAreaHectares: number;

  @ApiProperty({
    description: 'Área de vegetação',
    example: 10000.3,
  })
  vegetationAreaHectares: number;
}

class FarmsByState {
  @ApiProperty({
    description: 'Estado',
    example: 'SP',
  })
  state: string;

  @ApiProperty({
    description: 'Quantidade de fazendas',
    example: 50,
  })
  count: number;
}

class FarmsByCrop {
  @ApiProperty({
    description: 'Cultura',
    example: 'Soja',
  })
  cropName: string;

  @ApiProperty({
    description: 'Quantidade de fazendas',
    example: 50,
  })
  count: number;
}

export class Dashboard {
  @ApiProperty({
    description: 'Total de fazendas',
    example: 150,
  })
  totalFarms: number;

  @ApiProperty({
    description: 'Total de hectares',
    example: 45000.5,
  })
  totalHectares: number;

  @ApiProperty({
    description: 'Fazendas por estado',
    example: [
      { state: 'SP', count: 50 },
      { state: 'MG', count: 30 },
    ],
  })
  farmsByState: FarmsByState[];

  @ApiProperty({
    description: 'Fazendas por cultura',
    example: [
      { cropName: 'Soja', count: 80 },
      { cropName: 'Milho', count: 45 },
    ],
  })
  farmsByCrop: FarmsByCrop[];

  @ApiProperty({
    description: 'Uso do solo',
    example: {
      arableAreaHectares: 35000.2,
      vegetationAreaHectares: 10000.3,
    },
  })
  landUsage: LandUsage;
}
