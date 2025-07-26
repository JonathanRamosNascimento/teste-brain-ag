import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  @ApiProperty({
    description: 'Nome da fazenda',
    example: 'Fazenda Santa Maria',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @ApiProperty({
    description: 'Cidade da fazenda',
    example: 'São Paulo',
  })
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @ApiProperty({
    description: 'Estado da fazenda (sigla de 2 caracteres)',
    example: 'SP',
  })
  state: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Área total da fazenda em hectares',
    example: 1000.5,
    type: 'number',
  })
  totalAreaHectares: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Área agricultável da fazenda em hectares',
    example: 800.25,
    type: 'number',
  })
  arableAreaHectares: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Área de vegetação da fazenda em hectares',
    example: 200.25,
    type: 'number',
  })
  vegetationAreaHectares: number;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID do produtor proprietário da fazenda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  producerId: string;
}
