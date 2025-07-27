import { Test, TestingModule } from '@nestjs/testing';
import { FindDashboardUseCase } from './find-dashboard.use-case';
import { CountFarms } from '@modules/farm/use-cases/abstractions/count.abstraction';
import { FarmsByState } from '@modules/farm/use-cases/abstractions/farms-by-state.abstraction';
import { FindFarmsByCrop } from '@modules/farm/use-cases/abstractions/find-farms-by-crop.abstraction';
import { LandUsage } from '@modules/farm/use-cases/abstractions/land-usage.abstraction';
import { TotalAreaHectares } from '@modules/farm/use-cases/abstractions/total-area-hectares.abstraction';

describe('FindDashboardUseCase', () => {
  let useCase: FindDashboardUseCase;
  let countFarms: jest.Mocked<CountFarms>;
  let farmsByState: jest.Mocked<FarmsByState>;
  let findFarmsByCrop: jest.Mocked<FindFarmsByCrop>;
  let landUsage: jest.Mocked<LandUsage>;
  let totalAreaHectares: jest.Mocked<TotalAreaHectares>;

  const mockFarmsByState = [
    { state: 'SP', count: 50 },
    { state: 'MG', count: 30 },
    { state: 'RS', count: 20 },
  ];

  const mockFarmsByCrop = [
    { cropName: 'Soja', count: 80 },
    { cropName: 'Milho', count: 45 },
    { cropName: 'Algodão', count: 25 },
  ];

  const mockLandUsage = {
    arableAreaHectares: 35000.2,
    vegetationAreaHectares: 10000.3,
  };

  const mockTotalFarms = 150;
  const mockTotalHectares = 45000.5;

  beforeEach(async () => {
    const mockCountFarms = {
      execute: jest.fn(),
    };

    const mockFarmsByStateService = {
      execute: jest.fn(),
    };

    const mockFindFarmsByCrop = {
      execute: jest.fn(),
    };

    const mockLandUsageService = {
      execute: jest.fn(),
    };

    const mockTotalAreaHectaresService = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindDashboardUseCase,
        {
          provide: CountFarms,
          useValue: mockCountFarms,
        },
        {
          provide: FarmsByState,
          useValue: mockFarmsByStateService,
        },
        {
          provide: FindFarmsByCrop,
          useValue: mockFindFarmsByCrop,
        },
        {
          provide: LandUsage,
          useValue: mockLandUsageService,
        },
        {
          provide: TotalAreaHectares,
          useValue: mockTotalAreaHectaresService,
        },
      ],
    }).compile();

    useCase = module.get<FindDashboardUseCase>(FindDashboardUseCase);
    countFarms = module.get(CountFarms);
    farmsByState = module.get(FarmsByState);
    findFarmsByCrop = module.get(FindFarmsByCrop);
    landUsage = module.get(LandUsage);
    totalAreaHectares = module.get(TotalAreaHectares);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return complete dashboard data when all services return data', async () => {
    countFarms.execute.mockResolvedValue(mockTotalFarms);
    totalAreaHectares.execute.mockResolvedValue(mockTotalHectares);
    farmsByState.execute.mockResolvedValue(mockFarmsByState);
    findFarmsByCrop.execute.mockResolvedValue(mockFarmsByCrop);
    landUsage.execute.mockResolvedValue(mockLandUsage);

    const result = await useCase.execute();

    expect(countFarms.execute).toHaveBeenCalledTimes(1);
    expect(totalAreaHectares.execute).toHaveBeenCalledTimes(1);
    expect(farmsByState.execute).toHaveBeenCalledTimes(1);
    expect(findFarmsByCrop.execute).toHaveBeenCalledTimes(1);
    expect(landUsage.execute).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      totalFarms: mockTotalFarms,
      totalHectares: mockTotalHectares,
      farmsByState: mockFarmsByState,
      farmsByCrop: mockFarmsByCrop,
      landUsage: mockLandUsage,
    });
  });

  it('should return dashboard with zero values when no data exists', async () => {
    countFarms.execute.mockResolvedValue(0);
    totalAreaHectares.execute.mockResolvedValue(0);
    farmsByState.execute.mockResolvedValue([]);
    findFarmsByCrop.execute.mockResolvedValue([]);
    landUsage.execute.mockResolvedValue({
      arableAreaHectares: 0,
      vegetationAreaHectares: 0,
    });

    const result = await useCase.execute();

    expect(result.totalFarms).toBe(0);
    expect(result.totalHectares).toBe(0);
    expect(result.farmsByState).toEqual([]);
    expect(result.farmsByCrop).toEqual([]);
    expect(result.landUsage.arableAreaHectares).toBe(0);
    expect(result.landUsage.vegetationAreaHectares).toBe(0);
  });

  it('should call all services exactly once', async () => {
    countFarms.execute.mockResolvedValue(mockTotalFarms);
    totalAreaHectares.execute.mockResolvedValue(mockTotalHectares);
    farmsByState.execute.mockResolvedValue(mockFarmsByState);
    findFarmsByCrop.execute.mockResolvedValue(mockFarmsByCrop);
    landUsage.execute.mockResolvedValue(mockLandUsage);

    await useCase.execute();

    expect(countFarms.execute).toHaveBeenCalledTimes(1);
    expect(countFarms.execute).toHaveBeenCalledWith();
    expect(totalAreaHectares.execute).toHaveBeenCalledTimes(1);
    expect(totalAreaHectares.execute).toHaveBeenCalledWith();
    expect(farmsByState.execute).toHaveBeenCalledTimes(1);
    expect(farmsByState.execute).toHaveBeenCalledWith();
    expect(findFarmsByCrop.execute).toHaveBeenCalledTimes(1);
    expect(findFarmsByCrop.execute).toHaveBeenCalledWith();
    expect(landUsage.execute).toHaveBeenCalledTimes(1);
    expect(landUsage.execute).toHaveBeenCalledWith();
  });

  it('should propagate error when countFarms service fails', async () => {
    const serviceError = new Error('Erro ao contar fazendas');
    countFarms.execute.mockRejectedValue(serviceError);

    await expect(useCase.execute()).rejects.toThrow(serviceError);

    expect(countFarms.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate error when totalAreaHectares service fails', async () => {
    countFarms.execute.mockResolvedValue(mockTotalFarms);
    const serviceError = new Error('Erro ao calcular área total');
    totalAreaHectares.execute.mockRejectedValue(serviceError);

    await expect(useCase.execute()).rejects.toThrow(serviceError);

    expect(countFarms.execute).toHaveBeenCalledTimes(1);
    expect(totalAreaHectares.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate error when farmsByState service fails', async () => {
    countFarms.execute.mockResolvedValue(mockTotalFarms);
    totalAreaHectares.execute.mockResolvedValue(mockTotalHectares);
    const serviceError = new Error('Erro ao buscar fazendas por estado');
    farmsByState.execute.mockRejectedValue(serviceError);

    await expect(useCase.execute()).rejects.toThrow(serviceError);

    expect(countFarms.execute).toHaveBeenCalledTimes(1);
    expect(totalAreaHectares.execute).toHaveBeenCalledTimes(1);
    expect(farmsByState.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate error when findFarmsByCrop service fails', async () => {
    countFarms.execute.mockResolvedValue(mockTotalFarms);
    totalAreaHectares.execute.mockResolvedValue(mockTotalHectares);
    farmsByState.execute.mockResolvedValue(mockFarmsByState);
    const serviceError = new Error('Erro ao buscar fazendas por cultura');
    findFarmsByCrop.execute.mockRejectedValue(serviceError);

    await expect(useCase.execute()).rejects.toThrow(serviceError);

    expect(countFarms.execute).toHaveBeenCalledTimes(1);
    expect(totalAreaHectares.execute).toHaveBeenCalledTimes(1);
    expect(farmsByState.execute).toHaveBeenCalledTimes(1);
    expect(findFarmsByCrop.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate error when landUsage service fails', async () => {
    countFarms.execute.mockResolvedValue(mockTotalFarms);
    totalAreaHectares.execute.mockResolvedValue(mockTotalHectares);
    farmsByState.execute.mockResolvedValue(mockFarmsByState);
    findFarmsByCrop.execute.mockResolvedValue(mockFarmsByCrop);
    const serviceError = new Error('Erro ao calcular uso do solo');
    landUsage.execute.mockRejectedValue(serviceError);

    await expect(useCase.execute()).rejects.toThrow(serviceError);

    expect(countFarms.execute).toHaveBeenCalledTimes(1);
    expect(totalAreaHectares.execute).toHaveBeenCalledTimes(1);
    expect(farmsByState.execute).toHaveBeenCalledTimes(1);
    expect(findFarmsByCrop.execute).toHaveBeenCalledTimes(1);
    expect(landUsage.execute).toHaveBeenCalledTimes(1);
  });

  it('should handle single state and single crop correctly', async () => {
    const singleState = [{ state: 'SP', count: 100 }];
    const singleCrop = [{ cropName: 'Soja', count: 100 }];

    countFarms.execute.mockResolvedValue(100);
    totalAreaHectares.execute.mockResolvedValue(50000);
    farmsByState.execute.mockResolvedValue(singleState);
    findFarmsByCrop.execute.mockResolvedValue(singleCrop);
    landUsage.execute.mockResolvedValue(mockLandUsage);

    const result = await useCase.execute();

    expect(result.farmsByState).toHaveLength(1);
    expect(result.farmsByCrop).toHaveLength(1);
    expect(result.farmsByState[0]).toEqual({ state: 'SP', count: 100 });
    expect(result.farmsByCrop[0]).toEqual({ cropName: 'Soja', count: 100 });
  });

  it('should handle large numbers correctly', async () => {
    const largeTotalFarms = 999999;
    const largeTotalHectares = 1000000.5;

    countFarms.execute.mockResolvedValue(largeTotalFarms);
    totalAreaHectares.execute.mockResolvedValue(largeTotalHectares);
    farmsByState.execute.mockResolvedValue(mockFarmsByState);
    findFarmsByCrop.execute.mockResolvedValue(mockFarmsByCrop);
    landUsage.execute.mockResolvedValue(mockLandUsage);

    const result = await useCase.execute();

    expect(result.totalFarms).toBe(largeTotalFarms);
    expect(result.totalHectares).toBe(largeTotalHectares);
  });
});
