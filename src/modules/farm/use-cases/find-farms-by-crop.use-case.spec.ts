import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { FindFarmsByCropUseCase } from './find-farms-by-crop.use-case';

describe('FindFarmsByCropUseCase', () => {
  let useCase: FindFarmsByCropUseCase;
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
        FindFarmsByCropUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get(FarmsRepository);
    useCase = module.get(FindFarmsByCropUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return farms grouped by crop with counts', async () => {
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
  });

  it('should return empty array when there are no farms with crops', async () => {
    repository.findFarmsByCrop.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(repository.findFarmsByCrop).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return single crop when all farms have the same crop', async () => {
    const expectedResult = [{ cropName: 'Soja', count: 200 }];
    repository.findFarmsByCrop.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(repository.findFarmsByCrop).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(1);
    expect(result[0].cropName).toBe('Soja');
    expect(result[0].count).toBe(200);
  });

  it('should handle crops with zero count', async () => {
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
  });

  it('should handle crop names with special characters', async () => {
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
  });
});
