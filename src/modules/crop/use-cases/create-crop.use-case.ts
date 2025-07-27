import { ConflictException, Injectable } from '@nestjs/common';
import { CropsRepository } from '../repositories/crops.repository';
import { CreateCropDto } from '../dto/create-crop.dto';
import { Crop } from '../entities/crop.entity';
import { LoggingService } from '../../../logging/logging.service';

@Injectable()
export class CreateCropUseCase {
  constructor(
    private readonly repository: CropsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(data: CreateCropDto): Promise<Crop> {
    this.loggingService.logBusinessLogic(
      'CreateCropUseCase',
      'Iniciando criação de cultura',
      { cropName: data.name },
    );

    const crop = await this.repository.findByName(data.name);

    if (crop) {
      this.loggingService.logBusinessLogic(
        'CreateCropUseCase',
        'Tentativa de criar cultura duplicada',
        { cropName: data.name, existingCropId: crop.id },
      );
      throw new ConflictException('Cultura já cadastrada');
    }

    this.loggingService.logBusinessLogic(
      'CreateCropUseCase',
      'Verificação de duplicidade concluída - criando cultura',
      { cropName: data.name },
    );

    const newCrop = await this.repository.create(data);

    this.loggingService.logBusinessLogic(
      'CreateCropUseCase',
      'Cultura criada com sucesso',
      { cropId: newCrop.id, cropName: newCrop.name },
    );

    return newCrop;
  }
}
