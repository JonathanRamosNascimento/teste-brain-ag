import { PrismaModule } from '@database/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { FindDashboardUseCase } from './use-cases/find-dashboard.use-case';
import { FarmModule } from '@modules/farm/farm.module';

@Module({
  imports: [PrismaModule, FarmModule],
  controllers: [DashboardController],
  providers: [FindDashboardUseCase],
})
export class DashboardModule {}
