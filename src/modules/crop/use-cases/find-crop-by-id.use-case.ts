import { Injectable, NotFoundException } from '@nestjs/common';
import { Crop } from '../entities/crop.entity';
import { CropsRepository } from '../repositories/crops.repository';
import { FindCropById } from './abstractions/find-crop-by-id.abstraction';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class FindCropByIdUseCase implements FindCropById {
  constructor(
    private readonly repository: CropsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(id: string): Promise<Crop> {
    this.loggingService.logBusinessLogic(
      'FindCropByIdUseCase',
      'Iniciando busca de cultura por ID',
      { cropId: id },
    );

    const crop = await this.repository.findById(id);

    if (!crop) {
      this.loggingService.logBusinessLogic(
        'FindCropByIdUseCase',
        'Cultura não encontrada',
        { cropId: id },
      );
      throw new NotFoundException('Cultura não encontrada');
    }

    this.loggingService.logBusinessLogic(
      'FindCropByIdUseCase',
      'Cultura encontrada com sucesso',
      {
        cropId: crop.id,
        cropName: crop.name,
        cropCategory: crop.category,
      },
    );

    return crop;
  }
}
