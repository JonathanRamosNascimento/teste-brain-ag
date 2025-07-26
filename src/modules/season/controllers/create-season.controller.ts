import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { Season } from '../entities/season.entity';
import { CreateSeasonUseCase } from '../use-cases/create-season.use-case';

@ApiTags('Seasons')
@Controller('seasons')
export class CreateSeasonController {
  constructor(private readonly createSeasonUseCase: CreateSeasonUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova safra' })
  @ApiResponse({
    status: 201,
    description: 'Safras criada com sucesso',
    type: Season,
  })
  @ApiResponse({
    status: 409,
    description: 'Safra já cadastrada',
  })
  async execute(@Body() data: CreateSeasonDto) {
    return await this.createSeasonUseCase.execute(data);
  }
}
