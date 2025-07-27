import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { FarmsByStateUseCase } from './farms-by-state.use-case';
import { LoggingService } from '@logging/logging.service';

describe('FarmsByStateUseCase', () => {
  let useCase: FarmsByStateUseCase;
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
        FarmsByStateUseCase,
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
    useCase = module.get(FarmsByStateUseCase);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return farms grouped by state with counts', async () => {
    const expectedResult = [
      { state: 'SP', count: 50 },
      { state: 'MG', count: 30 },
      { state: 'RS', count: 25 },
    ];
    repository.farmsByState.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.farmsByState).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('state');
    expect(result[0]).toHaveProperty('count');

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FarmsByStateUseCase',
      'Iniciando busca de fazendas por estado',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FarmsByStateUseCase',
      'Busca de fazendas por estado concluída',
      { totalStates: 3 },
    );
  });

  it('should return empty array when there are no farms', async () => {
    repository.farmsByState.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(repository.farmsByState).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);

    // Verificar logs para caso vazio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FarmsByStateUseCase',
      'Iniciando busca de fazendas por estado',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FarmsByStateUseCase',
      'Busca de fazendas por estado concluída',
      { totalStates: 0 },
    );
  });

  it('should return single state when all farms are in the same state', async () => {
    const expectedResult = [{ state: 'SP', count: 100 }];
    repository.farmsByState.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.farmsByState).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(1);
    expect(result[0].state).toBe('SP');
    expect(result[0].count).toBe(100);

    // Verificar logs para caso de estado único
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FarmsByStateUseCase',
      'Iniciando busca de fazendas por estado',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FarmsByStateUseCase',
      'Busca de fazendas por estado concluída',
      { totalStates: 1 },
    );
  });

  it('should maintain correct order of logs', async () => {
    const expectedResult = [
      { state: 'SP', count: 25 },
      { state: 'RJ', count: 15 },
    ];
    repository.farmsByState.mockResolvedValue(expectedResult);

    await useCase.execute();

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls).toHaveLength(2);
    expect(logCalls[0][1]).toBe('Iniciando busca de fazendas por estado');
    expect(logCalls[1][1]).toBe('Busca de fazendas por estado concluída');
    expect(logCalls[1][2]).toEqual({ totalStates: 2 });
  });

  it('should log business logic with correct useCase name', async () => {
    const expectedResult = [{ state: 'MG', count: 10 }];
    repository.farmsByState.mockResolvedValue(expectedResult);

    await useCase.execute();

    // Verificar se o nome do caso de uso está correto nos logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'FarmsByStateUseCase',
      expect.any(String),
      expect.any(Object),
    );
  });
});
