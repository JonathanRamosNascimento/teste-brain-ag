import { CropsRepository } from '@modules/crop/repositories/crops.repository';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { PlantingsRepository } from '@modules/planting/repositories/plantings.repository';
import { ProducersRepository } from '@modules/producer/repositories/producers.repository';
import { SeasonsRepository } from '@modules/season/repositories/seasons.repository';
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaCropsRepository } from './repositories/prisma-crops.repository';
import { PrismaFarmsRepository } from './repositories/prisma-farms.repository';
import { PrismaPlantingsRepository } from './repositories/prisma-plantings.repository';
import { PrismaProducersRepository } from './repositories/prisma-producers.repository';
import { PrismaSeasonsRepository } from './repositories/prisma-seasons.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: ProducersRepository,
      useClass: PrismaProducersRepository,
    },
    {
      provide: FarmsRepository,
      useClass: PrismaFarmsRepository,
    },
    {
      provide: CropsRepository,
      useClass: PrismaCropsRepository,
    },
    {
      provide: SeasonsRepository,
      useClass: PrismaSeasonsRepository,
    },
    {
      provide: PlantingsRepository,
      useClass: PrismaPlantingsRepository,
    },
  ],
  exports: [
    PrismaService,
    ProducersRepository,
    FarmsRepository,
    CropsRepository,
    SeasonsRepository,
    PlantingsRepository,
  ],
})
export class PrismaModule {}
