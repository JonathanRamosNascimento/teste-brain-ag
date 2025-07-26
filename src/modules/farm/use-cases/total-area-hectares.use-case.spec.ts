import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { TotalAreaHectaresUseCase } from './total-area-hectares.use-case';

describe('TotalAreaHectaresUseCase', () => {
  let useCase: TotalAreaHectaresUseCase;
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
        TotalAreaHectaresUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get(FarmsRepository);
    useCase = module.get(TotalAreaHectaresUseCase);
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
  });

  it('should return 0 when there are no farms', async () => {
    repository.totalAreaHectares.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(repository.totalAreaHectares).toHaveBeenCalledTimes(1);
    expect(result).toBe(0);
  });

  it('should handle decimal values correctly', async () => {
    const expectedTotalArea = 12345.67;
    repository.totalAreaHectares.mockResolvedValue(expectedTotalArea);

    const result = await useCase.execute();

    expect(repository.totalAreaHectares).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedTotalArea);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('should handle large numbers correctly', async () => {
    const expectedTotalArea = 999999.99;
    repository.totalAreaHectares.mockResolvedValue(expectedTotalArea);

    const result = await useCase.execute();

    expect(repository.totalAreaHectares).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedTotalArea);
  });
});
