import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { LandUsageUseCase } from './land-usage.use-case';

describe('LandUsageUseCase', () => {
  let useCase: LandUsageUseCase;
  let repository: jest.Mocked<FarmsRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandUsageUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get(FarmsRepository);
    useCase = module.get(LandUsageUseCase);
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
  });

  it('should return empty array when there are no farms', async () => {
    repository.landUsage.mockResolvedValue({
      arableAreaHectares: 0,
      vegetationAreaHectares: 0,
    });

    const result = await useCase.execute();

    expect(repository.landUsage).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      arableAreaHectares: 0,
      vegetationAreaHectares: 0,
    });
  });

  it('should handle zero values correctly', async () => {
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
  });

  it('should handle decimal values correctly', async () => {
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
  });
});
