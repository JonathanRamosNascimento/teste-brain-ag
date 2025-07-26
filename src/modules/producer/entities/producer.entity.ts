import { Farm } from '@modules/farm/entities/farm.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Producer {
  @ApiProperty({
    description: 'ID do produtor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'CPF/CNPJ do produtor',
    example: '12345678901',
  })
  cpfCnpj: string;

  @ApiProperty({
    description: 'Nome do produtor',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Data de criação do produtor',
    example: '2021-01-01',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização do produtor',
    example: '2021-01-01',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Fazendas do produtor',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Fazenda 1',
      },
    ],
  })
  farms?: Farm[];
}
