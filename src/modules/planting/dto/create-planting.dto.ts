import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePlantingDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Área plantada em hectares',
    example: 100,
  })
  plantedAreaHectares: number;

  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'Data de plantio',
    example: '2021-01-01',
    required: false,
  })
  plantingDate?: Date;

  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'Data de colheita esperada',
    example: '2021-01-01',
    required: false,
  })
  expectedHarvestDate?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Notas do plantio',
    example: 'Plantação de soja',
    required: false,
  })
  notes?: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID da fazenda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  farmId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID da safra',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  seasonId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID da cultura',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cropId: string;
}
