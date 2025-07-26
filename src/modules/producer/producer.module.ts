import { PrismaModule } from '@database/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CreateProducerController } from './controllers/create-producer.controller';
import { UpdateProducerController } from './controllers/update-producer.controller';
import { CreateProducerUseCase } from './use-cases/create-producer.use-case';
import { UpdateProducerUseCase } from './use-cases/update-producer.use-case';
import { ValidationsDocuments } from './validators/validations-documents';
import { DeleteProducerController } from './controllers/delete-producer.controller';
import { DeleteProducerUseCase } from './use-cases/delete-producer.use-case';
import { FindAllProducersController } from './controllers/find-all-producers.controller';
import { FindAllProducersUseCase } from './use-cases/find-all-producers.use-case';
import { FindProducerByIdController } from './controllers/find-producer-by-id.controller';
import { FindProducerByIdUseCase } from './use-cases/find-producer-by-id.use-case';
import { FindProducerById } from './use-cases/abstractions/find-producer-by-id.abstraction';

@Module({
  imports: [PrismaModule],
  controllers: [
    DeleteProducerController,
    CreateProducerController,
    UpdateProducerController,
    FindAllProducersController,
    FindProducerByIdController,
  ],
  providers: [
    ValidationsDocuments,
    DeleteProducerUseCase,
    CreateProducerUseCase,
    UpdateProducerUseCase,
    FindAllProducersUseCase,
    {
      provide: FindProducerById,
      useClass: FindProducerByIdUseCase,
    },
  ],
  exports: [FindProducerById],
})
export class ProducerModule {}
