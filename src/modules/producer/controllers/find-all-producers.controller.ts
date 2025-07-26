import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Producer } from '../entities/producer.entity';
import { FindAllProducersUseCase } from '../use-cases/find-all-producers.use-case';

@ApiTags('Producers')
@Controller('producers')
export class FindAllProducersController {
  constructor(private readonly useCase: FindAllProducersUseCase) {}

  @Get('all')
  @ApiOperation({ summary: 'Buscar todos os produtores' })
  @ApiResponse({
    status: 200,
    description: 'Produtores encontrados com sucesso',
    type: [Producer],
  })
  async findAll() {
    return await this.useCase.execute();
  }
}
