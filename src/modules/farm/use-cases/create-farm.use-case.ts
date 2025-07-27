import { ConflictException, Injectable } from '@nestjs/common';
import { FarmsRepository } from '../repositories/farms.repository';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { Farm } from '../entities/farm.entity';
import { FindProducerById } from '@modules/producer/use-cases/abstractions/find-producer-by-id.abstraction';
import { ValidationArea } from '../validators/validation-area';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class CreateFarmUseCase {
  constructor(
    private readonly repository: FarmsRepository,
    private readonly validations: ValidationArea,
    private readonly findProducerById: FindProducerById,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(data: CreateFarmDto): Promise<Farm> {
    this.loggingService.logBusinessLogic(
      'CreateFarmUseCase',
      'Iniciando criação de fazenda',
      {
        producerId: data.producerId,
        farmName: data.name,
        totalArea: data.totalAreaHectares,
        arableArea: data.arableAreaHectares,
        vegetationArea: data.vegetationAreaHectares,
      },
    );

    this.loggingService.logBusinessLogic(
      'CreateFarmUseCase',
      'Validando existência do produtor',
      { producerId: data.producerId },
    );

    const producer = await this.findProducerById.execute(data.producerId);

    this.loggingService.logBusinessLogic(
      'CreateFarmUseCase',
      'Produtor validado com sucesso - validando áreas da fazenda',
      {
        producerId: producer.id,
        producerName: producer.name,
        totalArea: data.totalAreaHectares,
        arableArea: data.arableAreaHectares,
        vegetationArea: data.vegetationAreaHectares,
      },
    );

    if (
      !this.validations.validFarmAreas(
        data.totalAreaHectares,
        data.arableAreaHectares,
        data.vegetationAreaHectares,
      )
    ) {
      this.loggingService.logValidationError(
        'farmAreas',
        `total: ${data.totalAreaHectares}, arable: ${data.arableAreaHectares}, vegetation: ${data.vegetationAreaHectares}`,
        'Áreas da fazenda inválidas',
      );
      throw new ConflictException('Áreas da fazenda inválidas');
    }

    this.loggingService.logBusinessLogic(
      'CreateFarmUseCase',
      'Áreas da fazenda validadas com sucesso - criando fazenda',
      {
        producerId: data.producerId,
        farmName: data.name,
        validatedAreas: {
          total: data.totalAreaHectares,
          arable: data.arableAreaHectares,
          vegetation: data.vegetationAreaHectares,
        },
      },
    );

    const farm = await this.repository.create(data);

    this.loggingService.logBusinessLogic(
      'CreateFarmUseCase',
      'Fazenda criada com sucesso',
      {
        farmId: farm.id,
        farmName: farm.name,
        producerId: farm.producerId,
        totalArea: farm.totalAreaHectares,
        state: farm.state,
        city: farm.city,
      },
    );

    return farm;
  }
}
