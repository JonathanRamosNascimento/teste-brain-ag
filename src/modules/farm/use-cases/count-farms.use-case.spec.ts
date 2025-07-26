import { Test, TestingModule } from '@nestjs/testing';
import { FarmsRepository } from '../repositories/farms.repository';
import { CountFarmsUseCase } from './count-farms.use-case';

describe('CountFarmsUseCase', () => {
  let useCase: CountFarmsUseCase;
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
        CountFarmsUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get(FarmsRepository);
    useCase = module.get(CountFarmsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the total count of farms', async () => {
    const expectedCount = 150;
    repository.count.mockResolvedValue(expectedCount);

    const result = await useCase.execute();

    expect(repository.count).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedCount);
  });

  it('should return 0 when there are no farms', async () => {
    repository.count.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(repository.count).toHaveBeenCalledTimes(1);
    expect(result).toBe(0);
  });
});
