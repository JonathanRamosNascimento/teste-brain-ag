import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { TotalAreaHectaresUseCase } from './total-area-hectares.use-case';
import { LoggingService } from '@logging/logging.service';

describe('TotalAreaHectaresUseCase', () => {
  let useCase: TotalAreaHectaresUseCase;
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
        TotalAreaHectaresUseCase,
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
    useCase = module.get(TotalAreaHectaresUseCase);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the total area in hectares of all farms', async () => {
    const expectedTotalArea = 25000.5;
    repository.totalAreaHectares.mockResolvedValue(expectedTotalArea);

    const result = await useCase.execute();

    expect(repository.totalAreaHectares).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedTotalArea);
    expect(typeof result).toBe('number');

    // Verifica se o logging foi chamado corretamente
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'TotalAreaHectaresUseCase',
      'Iniciando cálculo da área total em hectares',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'TotalAreaHectaresUseCase',
      'Cálculo da área total concluído',
      { totalAreaHectares: expectedTotalArea },
    );
  });

  it('should return 0 when there are no farms', async () => {
    repository.totalAreaHectares.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(repository.totalAreaHectares).toHaveBeenCalledTimes(1);
    expect(result).toBe(0);

    // Verifica se o logging foi chamado corretamente
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'TotalAreaHectaresUseCase',
      'Iniciando cálculo da área total em hectares',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'TotalAreaHectaresUseCase',
      'Cálculo da área total concluído',
      { totalAreaHectares: 0 },
    );
  });

  it('should handle decimal values correctly', async () => {
    const expectedTotalArea = 12345.67;
    repository.totalAreaHectares.mockResolvedValue(expectedTotalArea);

    const result = await useCase.execute();

    expect(repository.totalAreaHectares).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedTotalArea);
    expect(Number.isFinite(result)).toBe(true);

    // Verifica se o logging foi chamado corretamente
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'TotalAreaHectaresUseCase',
      'Cálculo da área total concluído',
      { totalAreaHectares: expectedTotalArea },
    );
  });

  it('should handle large numbers correctly', async () => {
    const expectedTotalArea = 999999.99;
    repository.totalAreaHectares.mockResolvedValue(expectedTotalArea);

    const result = await useCase.execute();

    expect(repository.totalAreaHectares).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedTotalArea);

    // Verifica se o logging foi chamado corretamente
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'TotalAreaHectaresUseCase',
      'Cálculo da área total concluído',
      { totalAreaHectares: expectedTotalArea },
    );
  });

  it('should log business logic correctly when repository throws an error', async () => {
    const error = new Error('Database connection failed');
    repository.totalAreaHectares.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow(error);

    // Verifica se o logging de início foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'TotalAreaHectaresUseCase',
      'Iniciando cálculo da área total em hectares',
      {},
    );
  });
});
