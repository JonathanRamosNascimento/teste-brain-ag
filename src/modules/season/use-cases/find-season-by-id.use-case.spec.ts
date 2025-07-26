import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindSeasonByIdUseCase } from './find-season-by-id.use-case';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { Season } from '../entities/season.entity';

describe('FindSeasonByIdUseCase', () => {
  let useCase: FindSeasonByIdUseCase;
  let repository: jest.Mocked<SeasonsRepository>;

  const mockSeason: Season = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Safra 2024',
    year: 2024,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    active: true,
  };

  const validId = '123e4567-e89b-12d3-a456-426614174000';
  const nonExistentId = '456e7890-e89b-12d3-a456-426614174111';

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByNameAndYear: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindSeasonByIdUseCase,
        {
          provide: SeasonsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindSeasonByIdUseCase>(FindSeasonByIdUseCase);
    repository = module.get(SeasonsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return season when found by valid ID', async () => {
    repository.findById.mockResolvedValue(mockSeason);

    const result = await useCase.execute(validId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
    expect(result).toEqual(mockSeason);
  });

  it('should throw NotFoundException when season is not found', async () => {
    repository.findById.mockResolvedValue(null);

    const promise = useCase.execute(nonExistentId);

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Safra não encontrada');

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
  });

  it('should handle repository error correctly', async () => {
    const error = new Error('Database connection error');
    repository.findById.mockRejectedValue(error);

    await expect(useCase.execute(validId)).rejects.toThrow(error);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
  });

  it('should handle null season correctly', async () => {
    repository.findById.mockResolvedValue(null);

    const promise = useCase.execute(validId);

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Safra não encontrada');

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
  });
});
