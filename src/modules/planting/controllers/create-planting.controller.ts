import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePlantingUseCase } from '../use-cases/create-planting.use-case';
import { CreatePlantingDto } from '../dto/create-planting.dto';
import { Planting } from '../entities/planting.entity';

@ApiTags('Plantings')
@Controller('plantings')
export class CreatePlantingController {
  constructor(private readonly createPlantingUseCase: CreatePlantingUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo plantio' })
  @ApiResponse({
    status: 201,
    description: 'Plantio criado com sucesso',
    type: Planting,
  })
  @ApiResponse({
    status: 409,
    description: 'Plantio já cadastrado',
  })
  async execute(@Body() data: CreatePlantingDto) {
    return await this.createPlantingUseCase.execute(data);
  }
}
