import { Injectable, NotFoundException } from '@nestjs/common';
import { FindFarmById } from './abstractions/find-farm-by-id.abstraction';
import { FarmsRepository } from '../repositories/farms.repository';
import { Farm } from '../entities/farm.entity';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class FindFarmByIdUseCase implements FindFarmById {
  constructor(
    private readonly repository: FarmsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(id: string): Promise<Farm> {
    this.loggingService.logBusinessLogic(
      'FindFarmByIdUseCase',
      'Iniciando busca de fazenda por ID',
      { farmId: id },
    );

    const farm = await this.repository.findById(id);

    if (!farm) {
      this.loggingService.logBusinessLogic(
        'FindFarmByIdUseCase',
        'Fazenda não encontrada',
        { farmId: id },
      );
      throw new NotFoundException('Fazenda não encontrada');
    }

    this.loggingService.logBusinessLogic(
      'FindFarmByIdUseCase',
      'Fazenda encontrada com sucesso',
      {
        farmId: farm.id,
        farmName: farm.name,
        producerId: farm.producerId,
        state: farm.state,
        city: farm.city,
        totalArea: farm.totalAreaHectares,
      },
    );

    return farm;
  }
}
