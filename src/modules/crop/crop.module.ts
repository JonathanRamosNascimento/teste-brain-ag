import { PrismaModule } from '@database/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CreateCropController } from './controllers/create-crop.controller';
import { FindCropById } from './use-cases/abstractions/find-crop-by-id.abstraction';
import { CreateCropUseCase } from './use-cases/create-crop.use-case';
import { FindCropByIdUseCase } from './use-cases/find-crop-by-id.use-case';
import { LoggingModule } from '@logging/logging.module';

@Module({
  imports: [PrismaModule, LoggingModule],
  controllers: [CreateCropController],
  providers: [
    CreateCropUseCase,
    {
      provide: FindCropById,
      useClass: FindCropByIdUseCase,
    },
  ],
  exports: [FindCropById],
})
export class CropModule {}
