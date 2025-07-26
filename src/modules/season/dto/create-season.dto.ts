import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSeasonDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Nome da safra',
    example: '2024',
  })
  name: string;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  @ApiProperty({
    description: 'Ano da safra',
    example: 2024,
  })
  year: number;

  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    description: 'Data de início da safra',
    example: '2024-01-01',
  })
  startDate: Date;

  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    description: 'Data de fim da safra',
    example: '2024-01-01',
  })
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Se a safra está ativa',
    example: true,
    default: true,
  })
  active?: boolean;
}
