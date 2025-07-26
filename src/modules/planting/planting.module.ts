import { PrismaModule } from '@database/prisma/prisma.module';
import { CropModule } from '@modules/crop/crop.module';
import { FarmModule } from '@modules/farm/farm.module';
import { SeasonModule } from '@modules/season/season.module';
import { Module } from '@nestjs/common';
import { CreatePlantingController } from './controllers/create-planting.controller';
import { CreatePlantingUseCase } from './use-cases/create-planting.use-case';

@Module({
  imports: [FarmModule, SeasonModule, CropModule, PrismaModule],
  controllers: [CreatePlantingController],
  providers: [CreatePlantingUseCase],
})
export class PlantingModule {}
