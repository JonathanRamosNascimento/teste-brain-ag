import { Body, Controller, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateProducerDto } from '../dto/update-producer.dto';
import { Producer } from '../entities/producer.entity';
import { UpdateProducerUseCase } from '../use-cases/update-producer.use-case';

@ApiTags('Producers')
@Controller('producers')
export class UpdateProducerController {
  constructor(private readonly useCase: UpdateProducerUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Atualizar um produtor' })
  @ApiResponse({
    status: 200,
    description: 'Produtor atualizado com sucesso',
    type: Producer,
  })
  @ApiBody({
    type: UpdateProducerDto,
    description: 'Dados do produtor a serem atualizados',
  })
  async update(@Body() data: UpdateProducerDto) {
    return await this.useCase.execute(data);
  }
}
