import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindCropByIdUseCase } from './find-crop-by-id.use-case';
import { CropsRepository } from '../repositories/crops.repository';
import { Crop } from '../entities/crop.entity';
import { LoggingService } from '@logging/logging.service';

describe('FindCropByIdUseCase', () => {
  let useCase: FindCropByIdUseCase;
  let repository: jest.Mocked<CropsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockCrop: Crop = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Soja',
    description: 'Cultivada em regiões tropicais',
    category: 'Grãos',
  };

  const validCropId = '123e4567-e89b-12d3-a456-426614174000';
  const invalidCropId = '456e7890-e89b-12d3-a456-426614174111';

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
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
        FindCropByIdUseCase,
        {
          provide: CropsRepository,
          useValue: mockRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<FindCropByIdUseCase>(FindCropByIdUseCase);
    repository = module.get(CropsRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a crop when found by valid ID', async () => {
    repository.findById.mockResolvedValue(mockCrop);

    const result = await useCase.execute(validCropId);

    expect(repository.findById).toHaveBeenCalledWith(validCropId);
    expect(result).toEqual(mockCrop);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindCropByIdUseCase',
      'Iniciando busca de cultura por ID',
      { cropId: validCropId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindCropByIdUseCase',
      'Cultura encontrada com sucesso',
      {
        cropId: mockCrop.id,
        cropName: mockCrop.name,
        cropCategory: mockCrop.category,
      },
    );
  });

  it('should throw NotFoundException when crop is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidCropId)).rejects.toThrow(
      new NotFoundException('Cultura não encontrada'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidCropId);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindCropByIdUseCase',
      'Iniciando busca de cultura por ID',
      { cropId: invalidCropId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindCropByIdUseCase',
      'Cultura não encontrada',
      { cropId: invalidCropId },
    );
  });

  it('should call repository method exactly once', async () => {
    repository.findById.mockResolvedValue(mockCrop);

    await useCase.execute(validCropId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validCropId);
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validCropId)).rejects.toThrow(repositoryError);

    expect(repository.findById).toHaveBeenCalledWith(validCropId);

    // Verificar que apenas o log inicial foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'FindCropByIdUseCase',
      'Iniciando busca de cultura por ID',
      { cropId: validCropId },
    );
  });

  it('should log correct crop information when found', async () => {
    const differentCrop: Crop = {
      id: '999e8888-e89b-12d3-a456-426614174999',
      name: 'Milho',
      description: 'Cereal amplamente cultivado',
      category: 'Cereais',
    };

    repository.findById.mockResolvedValue(differentCrop);

    const result = await useCase.execute(differentCrop.id);

    expect(result).toEqual(differentCrop);

    // Verificar se os dados corretos foram logados
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindCropByIdUseCase',
      'Cultura encontrada com sucesso',
      {
        cropId: differentCrop.id,
        cropName: differentCrop.name,
        cropCategory: differentCrop.category,
      },
    );
  });

  it('should log the exact ID that was searched for', async () => {
    const searchId = 'unique-test-id-12345';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(searchId)).rejects.toThrow(NotFoundException);

    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindCropByIdUseCase',
      'Iniciando busca de cultura por ID',
      { cropId: searchId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindCropByIdUseCase',
      'Cultura não encontrada',
      { cropId: searchId },
    );
  });

  it('should handle crops with null optional fields correctly', async () => {
    const cropWithNullFields: Crop = {
      id: 'crop-with-nulls',
      name: 'Cultura Simples',
      description: null,
      category: null,
    };

    repository.findById.mockResolvedValue(cropWithNullFields);

    const result = await useCase.execute(cropWithNullFields.id);

    expect(result).toEqual(cropWithNullFields);

    // Verificar se os logs incluem campos null adequadamente
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindCropByIdUseCase',
      'Cultura encontrada com sucesso',
      {
        cropId: cropWithNullFields.id,
        cropName: cropWithNullFields.name,
        cropCategory: cropWithNullFields.category,
      },
    );
  });

  it('should maintain order of logs', async () => {
    repository.findById.mockResolvedValue(mockCrop);

    await useCase.execute(validCropId);

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando busca de cultura por ID');
    expect(logCalls[1][1]).toBe('Cultura encontrada com sucesso');
  });
});
