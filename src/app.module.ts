import { Module, ValidationPipe } from '@nestjs/common';
import { CropModule } from '@modules/crop/crop.module';
import { FarmModule } from '@modules/farm/farm.module';
import { PlantingModule } from '@modules/planting/planting.module';
import { ProducerModule } from '@modules/producer/producer.module';
import { SeasonModule } from '@modules/season/season.module';
import { APP_PIPE } from '@nestjs/core';
import { PrismaModule } from '@database/prisma/prisma.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    ProducerModule,
    FarmModule,
    SeasonModule,
    CropModule,
    PlantingModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
