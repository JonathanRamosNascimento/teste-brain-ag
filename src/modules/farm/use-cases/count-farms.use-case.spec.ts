import { Test, TestingModule } from '@nestjs/testing';
import { CountFarmsUseCase } from './count-farms.use-case';
import { FarmsRepository } from '@modules/farm/repositories/farms.repository';
import { LoggingService } from '@logging/logging.service';

describe('CountFarmsUseCase', () => {
  let useCase: CountFarmsUseCase;
  let repository: jest.Mocked<FarmsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

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
        CountFarmsUseCase,
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

    useCase = module.get<CountFarmsUseCase>(CountFarmsUseCase);
    repository = module.get(FarmsRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the count of farms', async () => {
    const expectedCount = 42;
    repository.count.mockResolvedValue(expectedCount);

    const result = await useCase.execute();

    expect(repository.count).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedCount);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CountFarmsUseCase',
      'Iniciando contagem de fazendas',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CountFarmsUseCase',
      'Contagem de fazendas concluída',
      { totalFarms: expectedCount },
    );
  });

  it('should return zero when no farms exist', async () => {
    repository.count.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(repository.count).toHaveBeenCalledTimes(1);
    expect(result).toBe(0);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CountFarmsUseCase',
      'Contagem de fazendas concluída',
      { totalFarms: 0 },
    );
  });

  it('should handle large numbers correctly', async () => {
    const largeCount = 999999;
    repository.count.mockResolvedValue(largeCount);

    const result = await useCase.execute();

    expect(result).toBe(largeCount);

    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CountFarmsUseCase',
      'Contagem de fazendas concluída',
      { totalFarms: largeCount },
    );
  });

  it('should maintain order of logs', async () => {
    repository.count.mockResolvedValue(5);

    await useCase.execute();

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando contagem de fazendas');
    expect(logCalls[1][1]).toBe('Contagem de fazendas concluída');
  });
});
