import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { FindFarmsByCropUseCase } from './find-farms-by-crop.use-case';
import { LoggingService } from '../../../logging/logging.service';

describe('FindFarmsByCropUseCase', () => {
  let useCase: FindFarmsByCropUseCase;
  let repository: jest.Mocked<FarmsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
      farmsByState: jest.fn(),
      totalAreaHectares: jest.fn(),
      findFarmsByCrop: jest.fn(),
      landUsage: jest.fn(),
    };

    const mockLoggingService = {
      logBusinessLogic: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindFarmsByCropUseCase,
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

    repository = module.get(FarmsRepository);
    loggingService = module.get(LoggingService);
    useCase = module.get(FindFarmsByCropUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return farms grouped by crop with counts and log business operations', async () => {
    const expectedResult = [
      { cropName: 'Soja', count: 80 },
      { cropName: 'Milho', count: 65 },
      { cropName: 'Algodão', count: 40 },
      { cropName: 'Café', count: 35 },
      { cropName: 'Cana de Açúcar', count: 25 },
    ];
    repository.findFarmsByCrop.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.findFarmsByCrop).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(5);
    expect(result[0]).toHaveProperty('cropName');
    expect(result[0]).toHaveProperty('count');
    expect(typeof result[0].cropName).toBe('string');
    expect(typeof result[0].count).toBe('number');

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);

    // Verificar log de início
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindFarmsByCropUseCase',
      'Iniciando busca de fazendas por cultura',
      {},
    );

    // Verificar log de conclusão
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmsByCropUseCase',
      'Busca de fazendas por cultura concluída',
      {
        totalCrops: 5,
        totalFarms: 245, // 80 + 65 + 40 + 35 + 25
      },
    );
  });

  it('should return empty array when there are no farms with crops and log appropriately', async () => {
    repository.findFarmsByCrop.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(repository.findFarmsByCrop).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);

    // Verificar log de início
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindFarmsByCropUseCase',
      'Iniciando busca de fazendas por cultura',
      {},
    );

    // Verificar log de conclusão com arrays vazios
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmsByCropUseCase',
      'Busca de fazendas por cultura concluída',
      {
        totalCrops: 0,
        totalFarms: 0,
      },
    );
  });

  it('should return single crop when all farms have the same crop and log correctly', async () => {
    const expectedResult = [{ cropName: 'Soja', count: 200 }];
    repository.findFarmsByCrop.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.findFarmsByCrop).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(1);
    expect(result[0].cropName).toBe('Soja');
    expect(result[0].count).toBe(200);

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);

    // Verificar log de conclusão com uma única cultura
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmsByCropUseCase',
      'Busca de fazendas por cultura concluída',
      {
        totalCrops: 1,
        totalFarms: 200,
      },
    );
  });

  it('should handle crops with zero count and log appropriately', async () => {
    const expectedResult = [
      { cropName: 'Soja', count: 50 },
      { cropName: 'Milho', count: 0 },
    ];
    repository.findFarmsByCrop.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.findFarmsByCrop).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(2);
    expect(result[1].count).toBe(0);

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);

    // Verificar log de conclusão considerando contagem zero
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmsByCropUseCase',
      'Busca de fazendas por cultura concluída',
      {
        totalCrops: 2,
        totalFarms: 50, // 50 + 0
      },
    );
  });

  it('should handle crop names with special characters and log correctly', async () => {
    const expectedResult = [
      { cropName: 'Cana-de-açúcar', count: 30 },
      { cropName: 'Feijão & Arroz', count: 20 },
    ];
    repository.findFarmsByCrop.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.findFarmsByCrop).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result[0].cropName).toBe('Cana-de-açúcar');
    expect(result[1].cropName).toBe('Feijão & Arroz');

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);

    // Verificar log de conclusão
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindFarmsByCropUseCase',
      'Busca de fazendas por cultura concluída',
      {
        totalCrops: 2,
        totalFarms: 50, // 30 + 20
      },
    );
  });

  it('should log business operations even when repository throws an error', async () => {
    const errorMessage = 'Database connection error';
    repository.findFarmsByCrop.mockRejectedValue(new Error(errorMessage));

    await expect(useCase.execute()).rejects.toThrow(errorMessage);

    // Verificar que o log de início foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'FindFarmsByCropUseCase',
      'Iniciando busca de fazendas por cultura',
      {},
    );

    // Verificar que o log de conclusão não foi chamado devido ao erro
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
  });
});
