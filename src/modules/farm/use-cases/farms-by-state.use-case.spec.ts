import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { FarmsByStateUseCase } from './farms-by-state.use-case';

describe('FarmsByStateUseCase', () => {
  let useCase: FarmsByStateUseCase;
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
        FarmsByStateUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get(FarmsRepository);
    useCase = module.get(FarmsByStateUseCase);
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
  });

  it('should return empty array when there are no farms', async () => {
    repository.farmsByState.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(repository.farmsByState).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
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
  });
});
