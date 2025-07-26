import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCropDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @ApiProperty({
    description: 'Nome da cultura',
    example: 'Soja',
  })
  name: string;

  @IsString()
  @IsOptional()
  @Length(2, 255)
  @ApiProperty({
    description: 'Descrição da cultura',
    example: 'Cultivada em regiões tropicais',
    required: false,
  })
  description?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  @ApiProperty({
    description: 'Categoria da cultura',
    example: 'Grãos',
    required: false,
  })
  category?: string;
}
