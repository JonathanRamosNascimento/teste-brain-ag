import { PrismaModule } from '@database/prisma/prisma.module';
import { ProducerModule } from '@modules/producer/producer.module';
import { Module } from '@nestjs/common';
import { CountFarmsController } from './controllers/count-farms.controller';
import { CreateFarmController } from './controllers/create-farm.controller';
import { FindFarmById } from './use-cases/abstractions/find-farm-by-id.abstraction';
import { CountFarmsUseCase } from './use-cases/count-farms.use-case';
import { CreateFarmUseCase } from './use-cases/create-farm.use-case';
import { FindFarmByIdUseCase } from './use-cases/find-farm-by-id.use-case';
import { ValidationArea } from './validators/validation-area';

@Module({
  imports: [PrismaModule, ProducerModule],
  controllers: [CreateFarmController, CountFarmsController],
  providers: [
    CreateFarmUseCase,
    ValidationArea,
    {
      provide: FindFarmById,
      useClass: FindFarmByIdUseCase,
    },
    CountFarmsUseCase,
  ],
  exports: [FindFarmById],
})
export class FarmModule {}
