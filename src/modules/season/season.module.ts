import { PrismaModule } from '@database/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { FindSeasonById } from './use-cases/abstractions/find-season-by-id.abstraction';
import { FindSeasonByIdUseCase } from './use-cases/find-season-by-id.use-case';
import { CreateSeasonController } from './controllers/create-season.controller';
import { CreateSeasonUseCase } from './use-cases/create-season.use-case';
import { LoggingModule } from '../../logging/logging.module';

@Module({
  imports: [PrismaModule, LoggingModule],
  controllers: [CreateSeasonController],
  providers: [
    {
      provide: FindSeasonById,
      useClass: FindSeasonByIdUseCase,
    },
    CreateSeasonUseCase,
  ],
  exports: [FindSeasonById],
})
export class SeasonModule {}
