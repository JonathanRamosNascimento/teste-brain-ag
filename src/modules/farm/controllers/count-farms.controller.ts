import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CountFarmsUseCase } from '../use-cases/count-farms.use-case';

@ApiTags('Farms')
@Controller('farms')
export class CountFarmsController {
  constructor(private readonly countFarmsUseCase: CountFarmsUseCase) {}

  @Get('count')
  @ApiOperation({ summary: 'Contar fazendas' })
  @ApiResponse({
    status: 200,
    description: 'Quantidade de fazendas',
    type: Number,
  })
  async countFarms() {
    return await this.countFarmsUseCase.execute();
  }
}
