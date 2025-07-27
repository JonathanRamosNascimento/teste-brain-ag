import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreatePlantingUseCase } from './create-planting.use-case';
import { PlantingsRepository } from '../repositories/plantings.repository';
import { FindCropById } from '@modules/crop/use-cases/abstractions/find-crop-by-id.abstraction';
import { FindFarmById } from '@modules/farm/use-cases/abstractions/find-farm-by-id.abstraction';
import { FindSeasonById } from '@modules/season/use-cases/abstractions/find-season-by-id.abstraction';
import { CreatePlantingDto } from '../dto/create-planting.dto';
import { Planting } from '../entities/planting.entity';
import { Crop } from '@modules/crop/entities/crop.entity';
import { Farm } from '@modules/farm/entities/farm.entity';
import { Season } from '@modules/season/entities/season.entity';
import { LoggingService } from '@logging/logging.service';

describe('CreatePlantingUseCase', () => {
  let useCase: CreatePlantingUseCase;
  let repository: jest.Mocked<PlantingsRepository>;
  let findCropById: jest.Mocked<FindCropById>;
  let findFarmById: jest.Mocked<FindFarmById>;
  let findSeasonById: jest.Mocked<FindSeasonById>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockCreatePlantingDto: CreatePlantingDto = {
    plantedAreaHectares: 100.5,
    plantingDate: new Date('2025-01-15'),
    expectedHarvestDate: new Date('2025-06-15'),
    notes: 'Plantio de soja para safra 2025',
    farmId: '123e4567-e89b-12d3-a456-426614174000',
    seasonId: '456e7890-e89b-12d3-a456-426614174001',
    cropId: '789e0123-e89b-12d3-a456-426614174002',
  };

  const mockCrop: Crop = {
    id: '789e0123-e89b-12d3-a456-426614174002',
    name: 'Soja',
    description: 'Cultivada em regiões tropicais',
    category: 'Grãos',
  };

  const mockFarm: Farm = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Fazenda Santa Maria',
    city: 'São Paulo',
    state: 'SP',
    totalAreaHectares: 1000.5,
    arableAreaHectares: 800.25,
    vegetationAreaHectares: 200.25,
    producerId: '456e7890-e89b-12d3-a456-426614174001',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  const mockSeason: Season = {
    id: '456e7890-e89b-12d3-a456-426614174001',
    name: 'Safra 2025',
    year: 2025,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    active: true,
  };

  const mockPlanting: Planting = {
    id: '012e3456-e89b-12d3-a456-426614174003',
    plantedAreaHectares: 100.5,
    plantingDate: new Date('2025-01-15'),
    expectedHarvestDate: new Date('2025-06-15'),
    notes: 'Plantio de soja para safra 2025',
    farmId: '123e4567-e89b-12d3-a456-426614174000',
    seasonId: '456e7890-e89b-12d3-a456-426614174001',
    cropId: '789e0123-e89b-12d3-a456-426614174002',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByCropAndSeasonAndFarm: jest.fn(),
    };

    const mockFindCropById = {
      execute: jest.fn(),
    };

    const mockFindFarmById = {
      execute: jest.fn(),
    };

    const mockFindSeasonById = {
      execute: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logBusinessLogic: jest.fn(),
      logValidationError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePlantingUseCase,
        {
          provide: PlantingsRepository,
          useValue: mockRepository,
        },
        {
          provide: FindCropById,
          useValue: mockFindCropById,
        },
        {
          provide: FindFarmById,
          useValue: mockFindFarmById,
        },
        {
          provide: FindSeasonById,
          useValue: mockFindSeasonById,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<CreatePlantingUseCase>(CreatePlantingUseCase);
    repository = module.get(PlantingsRepository);
    findCropById = module.get(FindCropById);
    findFarmById = module.get(FindFarmById);
    findSeasonById = module.get(FindSeasonById);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a planting successfully when data is valid and planting does not exist', async () => {
    findCropById.execute.mockResolvedValue(mockCrop);
    findFarmById.execute.mockResolvedValue(mockFarm);
    findSeasonById.execute.mockResolvedValue(mockSeason);
    repository.findByCropAndSeasonAndFarm.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockPlanting);

    const result = await useCase.execute(mockCreatePlantingDto);

    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'CreatePlantingUseCase',
      'Iniciando criação de plantio',
      {
        cropId: mockCreatePlantingDto.cropId,
        seasonId: mockCreatePlantingDto.seasonId,
        farmId: mockCreatePlantingDto.farmId,
        plantedAreaHectares: mockCreatePlantingDto.plantedAreaHectares,
      },
    );

    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'CreatePlantingUseCase',
      'Plantio criado com sucesso',
      {
        plantingId: mockPlanting.id,
        cropId: mockCreatePlantingDto.cropId,
        seasonId: mockCreatePlantingDto.seasonId,
        farmId: mockCreatePlantingDto.farmId,
        plantedAreaHectares: mockCreatePlantingDto.plantedAreaHectares,
      },
    );

    expect(findCropById.execute).toHaveBeenCalledWith(
      mockCreatePlantingDto.cropId,
    );
    expect(findFarmById.execute).toHaveBeenCalledWith(
      mockCreatePlantingDto.farmId,
    );
    expect(findSeasonById.execute).toHaveBeenCalledWith(
      mockCreatePlantingDto.seasonId,
    );
    expect(repository.findByCropAndSeasonAndFarm).toHaveBeenCalledWith(
      mockCreatePlantingDto.cropId,
      mockCreatePlantingDto.seasonId,
      mockCreatePlantingDto.farmId,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreatePlantingDto);
    expect(result).toEqual(mockPlanting);
  });

  it('should throw ConflictException when planting already exists for the same crop, season and farm', async () => {
    const existingPlanting: Planting = {
      ...mockPlanting,
      id: 'existing-planting-id',
    };

    findCropById.execute.mockResolvedValue(mockCrop);
    findFarmById.execute.mockResolvedValue(mockFarm);
    findSeasonById.execute.mockResolvedValue(mockSeason);
    repository.findByCropAndSeasonAndFarm.mockResolvedValue(existingPlanting);

    await expect(useCase.execute(mockCreatePlantingDto)).rejects.toThrow(
      new ConflictException('Plantio já cadastrado'),
    );

    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'CreatePlantingUseCase',
      'Iniciando criação de plantio',
      {
        cropId: mockCreatePlantingDto.cropId,
        seasonId: mockCreatePlantingDto.seasonId,
        farmId: mockCreatePlantingDto.farmId,
        plantedAreaHectares: mockCreatePlantingDto.plantedAreaHectares,
      },
    );

    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'CreatePlantingUseCase',
      'Tentativa de criar plantio duplicado',
      {
        cropId: mockCreatePlantingDto.cropId,
        seasonId: mockCreatePlantingDto.seasonId,
        farmId: mockCreatePlantingDto.farmId,
        existingPlantingId: existingPlanting.id,
      },
    );

    expect(findCropById.execute).toHaveBeenCalledWith(
      mockCreatePlantingDto.cropId,
    );
    expect(findFarmById.execute).toHaveBeenCalledWith(
      mockCreatePlantingDto.farmId,
    );
    expect(findSeasonById.execute).toHaveBeenCalledWith(
      mockCreatePlantingDto.seasonId,
    );
    expect(repository.findByCropAndSeasonAndFarm).toHaveBeenCalledWith(
      mockCreatePlantingDto.cropId,
      mockCreatePlantingDto.seasonId,
      mockCreatePlantingDto.farmId,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should validate related entities before creating planting', async () => {
    findCropById.execute.mockResolvedValue(mockCrop);
    findFarmById.execute.mockResolvedValue(mockFarm);
    findSeasonById.execute.mockResolvedValue(mockSeason);
    repository.findByCropAndSeasonAndFarm.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockPlanting);

    await useCase.execute(mockCreatePlantingDto);

    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(findCropById.execute).toHaveBeenCalledTimes(1);
    expect(findFarmById.execute).toHaveBeenCalledTimes(1);
    expect(findSeasonById.execute).toHaveBeenCalledTimes(1);
    expect(repository.findByCropAndSeasonAndFarm).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });
});
