import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteProducerParamsDto } from '../dto/delete-producer-params.dto';
import { DeleteProducerUseCase } from '../use-cases/delete-producer.use-case';

@ApiTags('Producers')
@Controller('producers')
export class DeleteProducerController {
  constructor(private readonly useCase: DeleteProducerUseCase) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um produtor' })
  @ApiResponse({
    status: 200,
    description: 'Produtor deletado com sucesso',
  })
  async delete(@Param() params: DeleteProducerParamsDto) {
    return await this.useCase.execute(params.id);
  }
}
