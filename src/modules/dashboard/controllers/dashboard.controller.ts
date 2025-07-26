import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Dashboard } from '../entities/dashboard.entity';
import { FindDashboardUseCase } from '../use-cases/find-dashboard.use-case';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly findDashboardUseCase: FindDashboardUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Buscar os dados do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dados do dashboard buscado com sucesso',
    type: Dashboard,
  })
  async execute() {
    return await this.findDashboardUseCase.execute();
  }
}
