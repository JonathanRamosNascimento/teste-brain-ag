import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateProducerDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  @ApiProperty({
    description: 'Nome do produtor',
    example: 'John Doe',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 14)
  @ApiProperty({
    description: 'CPF/CNPJ do produtor',
    example: '56712773024',
  })
  cpfCnpj: string;
}
