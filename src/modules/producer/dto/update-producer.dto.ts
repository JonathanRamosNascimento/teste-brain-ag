import { PartialType } from '@nestjs/mapped-types';
import { CreateProducerDto } from './create-producer.dto';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProducerDto extends PartialType(CreateProducerDto) {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID do produtor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @IsString()
  @IsOptional()
  @Length(2, 255)
  @ApiProperty({
    description: 'Nome do produtor',
    example: 'John Doe',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @Length(11, 14)
  @ApiProperty({
    description: 'CPF/CNPJ do produtor',
    example: '12345678901',
  })
  cpfCnpj?: string;
}
