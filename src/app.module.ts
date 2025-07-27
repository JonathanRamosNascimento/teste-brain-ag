import { Module, ValidationPipe } from '@nestjs/common';
import { CropModule } from '@modules/crop/crop.module';
import { FarmModule } from '@modules/farm/farm.module';
import { PlantingModule } from '@modules/planting/planting.module';
import { ProducerModule } from '@modules/producer/producer.module';
import { SeasonModule } from '@modules/season/season.module';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from '@database/prisma/prisma.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { LoggingModule } from './logging/logging.module';
import { HttpLoggingInterceptor } from './logging/http-logging.interceptor';
import { ExceptionLoggingFilter } from './logging/exception-logging.filter';

@Module({
  imports: [
    LoggingModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionLoggingFilter,
    },
  ],
})
export class AppModule {}
