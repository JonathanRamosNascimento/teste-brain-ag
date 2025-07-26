import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateSeasonUseCase } from './create-season.use-case';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { Season } from '../entities/season.entity';

describe('CreateSeasonUseCase', () => {
  let useCase: CreateSeasonUseCase;
  let repository: jest.Mocked<SeasonsRepository>;

  const mockCreateSeasonDto: CreateSeasonDto = {
    name: 'Safra 2024',
    year: 2024,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    active: true,
  };

  const mockSeason: Season = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Safra 2024',
    year: 2024,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    active: true,
  };

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
        CreateSeasonUseCase,
        {
          provide: SeasonsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateSeasonUseCase>(CreateSeasonUseCase);
    repository = module.get(SeasonsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a season successfully when data is valid', async () => {
    repository.findByNameAndYear.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockSeason);

    const result = await useCase.execute(mockCreateSeasonDto);

    expect(repository.findByNameAndYear).toHaveBeenCalledWith(
      mockCreateSeasonDto.name,
      mockCreateSeasonDto.year,
    );
    expect(repository.findByNameAndYear).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(mockCreateSeasonDto);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSeason);
  });

  it('should throw ConflictException when season with same name and year already exists', async () => {
    repository.findByNameAndYear.mockResolvedValue(mockSeason);

    const promise = useCase.execute(mockCreateSeasonDto);

    await expect(promise).rejects.toThrow(ConflictException);
    await expect(promise).rejects.toThrow(
      'Safras com o mesmo nome e ano já existem',
    );

    expect(repository.findByNameAndYear).toHaveBeenCalledWith(
      mockCreateSeasonDto.name,
      mockCreateSeasonDto.year,
    );
    expect(repository.findByNameAndYear).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should handle creation error correctly', async () => {
    const error = new Error('Database error');
    repository.findByNameAndYear.mockResolvedValue(null);
    repository.create.mockRejectedValue(error);

    await expect(useCase.execute(mockCreateSeasonDto)).rejects.toThrow(error);

    expect(repository.findByNameAndYear).toHaveBeenCalledWith(
      mockCreateSeasonDto.name,
      mockCreateSeasonDto.year,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateSeasonDto);
  });
});
