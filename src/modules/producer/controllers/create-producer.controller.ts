import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProducerDto } from '../dto/create-producer.dto';
import { Producer } from '../entities/producer.entity';
import { CreateProducerUseCase } from '../use-cases/create-producer.use-case';

@ApiTags('Producers')
@Controller('producers')
export class CreateProducerController {
  constructor(private readonly useCase: CreateProducerUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo produtor' })
  @ApiResponse({
    status: 201,
    description: 'Produtor criado com sucesso',
    type: Producer,
  })
  async create(@Body() data: CreateProducerDto) {
    return await this.useCase.execute(data);
  }
}
