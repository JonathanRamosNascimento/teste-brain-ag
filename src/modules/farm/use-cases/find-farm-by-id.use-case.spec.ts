import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindFarmByIdUseCase } from './find-farm-by-id.use-case';
import { FarmsRepository } from '../repositories/farms.repository';
import { Farm } from '../entities/farm.entity';
import { LoggingService } from '@logging/logging.service';

describe('FindFarmByIdUseCase', () => {
  let useCase: FindFarmByIdUseCase;
  let repository: jest.Mocked<FarmsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockFarm: Farm = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Fazenda Santa Maria',
    city: 'São Paulo',
    state: 'SP',
    totalAreaHectares: 1000,
    arableAreaHectares: 600,
    vegetationAreaHectares: 400,
    producerId: '456e7890-e89b-12d3-a456-426614174111',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  const validFarmId = '123e4567-e89b-12d3-a456-426614174000';
  const invalidFarmId = '999e9999-e99b-99d9-a999-999999999999';

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      totalAreaHectares: jest.fn(),
      farmsByState: jest.fn(),
      landUsage: jest.fn(),
      findFarmsByCrop: jest.fn(),
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
        FindFarmByIdUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<FindFarmByIdUseCase>(FindFarmByIdUseCase);
    repository = module.get(FarmsRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a farm when found by valid ID', async () => {
    repository.findById.mockResolvedValue(mockFarm);

    const result = await useCase.execute(validFarmId);

    expect(repository.findById).toHaveBeenCalledWith(validFarmId);
    expect(result).toEqual(mockFarm);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindFarmByIdUseCase',
      'Iniciando busca de fazenda por ID',
      { farmId: validFarmId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmByIdUseCase',
      'Fazenda encontrada com sucesso',
      {
        farmId: mockFarm.id,
        farmName: mockFarm.name,
        producerId: mockFarm.producerId,
        state: mockFarm.state,
        city: mockFarm.city,
        totalArea: mockFarm.totalAreaHectares,
      },
    );
  });

  it('should throw NotFoundException when farm is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidFarmId)).rejects.toThrow(
      new NotFoundException('Fazenda não encontrada'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidFarmId);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindFarmByIdUseCase',
      'Iniciando busca de fazenda por ID',
      { farmId: invalidFarmId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmByIdUseCase',
      'Fazenda não encontrada',
      { farmId: invalidFarmId },
    );
  });

  it('should call repository method exactly once', async () => {
    repository.findById.mockResolvedValue(mockFarm);

    await useCase.execute(validFarmId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validFarmId);
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validFarmId)).rejects.toThrow(repositoryError);

    expect(repository.findById).toHaveBeenCalledWith(validFarmId);

    // Verificar que apenas o log inicial foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'FindFarmByIdUseCase',
      'Iniciando busca de fazenda por ID',
      { farmId: validFarmId },
    );
  });

  it('should log correct farm information when found', async () => {
    const differentFarm: Farm = {
      id: 'different-farm-id',
      name: 'Fazenda do Norte',
      city: 'Brasília',
      state: 'DF',
      totalAreaHectares: 500,
      arableAreaHectares: 300,
      vegetationAreaHectares: 200,
      producerId: 'different-producer-id',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-06-15'),
    };

    repository.findById.mockResolvedValue(differentFarm);

    const result = await useCase.execute(differentFarm.id);

    expect(result).toEqual(differentFarm);

    // Verificar se os dados corretos foram logados
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmByIdUseCase',
      'Fazenda encontrada com sucesso',
      {
        farmId: differentFarm.id,
        farmName: differentFarm.name,
        producerId: differentFarm.producerId,
        state: differentFarm.state,
        city: differentFarm.city,
        totalArea: differentFarm.totalAreaHectares,
      },
    );
  });

  it('should log the exact ID that was searched for', async () => {
    const searchId = 'unique-test-id-12345';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(searchId)).rejects.toThrow(NotFoundException);

    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindFarmByIdUseCase',
      'Iniciando busca de fazenda por ID',
      { farmId: searchId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmByIdUseCase',
      'Fazenda não encontrada',
      { farmId: searchId },
    );
  });

  it('should maintain order of logs', async () => {
    repository.findById.mockResolvedValue(mockFarm);

    await useCase.execute(validFarmId);

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando busca de fazenda por ID');
    expect(logCalls[1][1]).toBe('Fazenda encontrada com sucesso');
  });
});
