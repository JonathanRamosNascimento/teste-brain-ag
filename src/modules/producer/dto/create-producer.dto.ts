import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProducerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nome do produtor',
    example: 'John Doe',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'CPF/CNPJ do produtor',
    example: '12345678901',
  })
  cpfCnpj: string;
}
