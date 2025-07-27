import { LoggingService } from '@logging/logging.service';
import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { LandUsageUseCase } from './land-usage.use-case';

describe('LandUsageUseCase', () => {
  let useCase: LandUsageUseCase;
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
        LandUsageUseCase,
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
    useCase = module.get(LandUsageUseCase);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return land usage data with arable and vegetation areas', async () => {
    const expectedResult = {
      arableAreaHectares: 1500.5,
      vegetationAreaHectares: 800.2,
    };
    repository.landUsage.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.landUsage).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveProperty('arableAreaHectares');
    expect(result).toHaveProperty('vegetationAreaHectares');
    expect(typeof result.arableAreaHectares).toBe('number');
    expect(typeof result.vegetationAreaHectares).toBe('number');

    // Verificar logging no início
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'LandUsageUseCase',
      'Iniciando cálculo de uso da terra',
      {},
    );

    // Verificar logging no final com dados calculados
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'LandUsageUseCase',
      'Cálculo de uso da terra concluído',
      {
        arableAreaHectares: expectedResult.arableAreaHectares,
        vegetationAreaHectares: expectedResult.vegetationAreaHectares,
        totalUsedArea:
          expectedResult.arableAreaHectares +
          expectedResult.vegetationAreaHectares,
      },
    );

    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
  });

  it('should return empty result when there are no farms and log appropriately', async () => {
    const expectedResult = {
      arableAreaHectares: 0,
      vegetationAreaHectares: 0,
    };
    repository.landUsage.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.landUsage).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);

    // Verificar logging no início
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'LandUsageUseCase',
      'Iniciando cálculo de uso da terra',
      {},
    );

    // Verificar logging no final com valores zero
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'LandUsageUseCase',
      'Cálculo de uso da terra concluído',
      {
        arableAreaHectares: 0,
        vegetationAreaHectares: 0,
        totalUsedArea: 0,
      },
    );

    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
  });

  it('should handle zero values correctly and log them', async () => {
    const expectedResult = {
      arableAreaHectares: 0,
      vegetationAreaHectares: 1000,
    };
    repository.landUsage.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.landUsage).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result.arableAreaHectares).toBe(0);
    expect(result.vegetationAreaHectares).toBe(1000);

    // Verificar logging com valores mistos (zero e valor positivo)
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'LandUsageUseCase',
      'Cálculo de uso da terra concluído',
      {
        arableAreaHectares: 0,
        vegetationAreaHectares: 1000,
        totalUsedArea: 1000,
      },
    );

    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
  });

  it('should handle decimal values correctly and log them with precision', async () => {
    const expectedResult = {
      arableAreaHectares: 1234.56,
      vegetationAreaHectares: 987.65,
    };
    repository.landUsage.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.landUsage).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(Number.isFinite(result.arableAreaHectares)).toBe(true);
    expect(Number.isFinite(result.vegetationAreaHectares)).toBe(true);

    // Verificar logging com valores decimais
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'LandUsageUseCase',
      'Cálculo de uso da terra concluído',
      {
        arableAreaHectares: 1234.56,
        vegetationAreaHectares: 987.65,
        totalUsedArea: 2222.21,
      },
    );

    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
  });
});
