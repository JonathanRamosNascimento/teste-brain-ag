import { Body, Controller, Post } from '@nestjs/common';
import { CreateFarmUseCase } from '../use-cases/create-farm.use-case';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { Farm } from '../entities/farm.entity';

@ApiTags('Farms')
@Controller('farms')
export class CreateFarmController {
  constructor(private readonly createFarmUseCase: CreateFarmUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova fazenda' })
  @ApiResponse({
    status: 201,
    description: 'Fazenda criada com sucesso',
    type: Farm,
  })
  @ApiResponse({
    status: 404,
    description: 'Produtor não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Áreas da fazenda inválidas',
  })
  async createFarm(@Body() data: CreateFarmDto) {
    return await this.createFarmUseCase.execute(data);
  }
}
