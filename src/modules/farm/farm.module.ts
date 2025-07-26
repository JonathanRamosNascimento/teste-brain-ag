import { PrismaModule } from '@database/prisma/prisma.module';
import { ProducerModule } from '@modules/producer/producer.module';
import { Module } from '@nestjs/common';
import { CreateFarmController } from './controllers/create-farm.controller';
import { CountFarms } from './use-cases/abstractions/count.abstraction';
import { FarmsByState } from './use-cases/abstractions/farms-by-state.abstraction';
import { FindFarmById } from './use-cases/abstractions/find-farm-by-id.abstraction';
import { FindFarmsByCrop } from './use-cases/abstractions/find-farms-by-crop.abstraction';
import { LandUsage } from './use-cases/abstractions/land-usage.abstraction';
import { TotalAreaHectares } from './use-cases/abstractions/total-area-hectares.abstraction';
import { CountFarmsUseCase } from './use-cases/count-farms.use-case';
import { CreateFarmUseCase } from './use-cases/create-farm.use-case';
import { FarmsByStateUseCase } from './use-cases/farms-by-state.use-case';
import { FindFarmByIdUseCase } from './use-cases/find-farm-by-id.use-case';
import { FindFarmsByCropUseCase } from './use-cases/find-farms-by-crop.use-case';
import { LandUsageUseCase } from './use-cases/land-usage.use-case';
import { TotalAreaHectaresUseCase } from './use-cases/total-area-hectares.use-case';
import { ValidationArea } from './validators/validation-area';

@Module({
  imports: [PrismaModule, ProducerModule],
  controllers: [CreateFarmController],
  providers: [
    CreateFarmUseCase,
    ValidationArea,
    {
      provide: FindFarmById,
      useClass: FindFarmByIdUseCase,
    },
    {
      provide: CountFarms,
      useClass: CountFarmsUseCase,
    },
    {
      provide: FarmsByState,
      useClass: FarmsByStateUseCase,
    },
    {
      provide: FindFarmsByCrop,
      useClass: FindFarmsByCropUseCase,
    },
    {
      provide: LandUsage,
      useClass: LandUsageUseCase,
    },
    {
      provide: TotalAreaHectares,
      useClass: TotalAreaHectaresUseCase,
    },
  ],
  exports: [
    FindFarmById,
    CountFarms,
    FarmsByState,
    FindFarmsByCrop,
    LandUsage,
    TotalAreaHectares,
  ],
})
export class FarmModule {}
