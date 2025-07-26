import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindProducerByIdParamsDto } from '../dto/find-producer-by-id-params.dto';
import { Producer } from '../entities/producer.entity';
import { FindProducerById } from '../use-cases/abstractions/find-producer-by-id.abstraction';

@ApiTags('Producers')
@Controller('producers')
export class FindProducerByIdController {
  constructor(private readonly useCase: FindProducerById) {}

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produtor por ID' })
  @ApiResponse({
    status: 200,
    description: 'Produtor encontrado com sucesso',
    type: Producer,
  })
  async findById(@Param() params: FindProducerByIdParamsDto) {
    return await this.useCase.execute(params.id);
  }
}
