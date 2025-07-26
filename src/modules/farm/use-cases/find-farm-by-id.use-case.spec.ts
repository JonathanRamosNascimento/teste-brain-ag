import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindFarmByIdUseCase } from './find-farm-by-id.use-case';
import { FarmsRepository } from '../repositories/farms.repository';
import { Farm } from '../entities/farm.entity';

describe('FindFarmByIdUseCase', () => {
  let useCase: FindFarmByIdUseCase;
  let repository: jest.Mocked<FarmsRepository>;

  const mockFarm: Farm = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Fazenda Santa Maria',
    city: 'São Paulo',
    state: 'SP',
    totalAreaHectares: 1000.5,
    arableAreaHectares: 800.25,
    vegetationAreaHectares: 200.25,
    producerId: '456e7890-e89b-12d3-a456-426614174001',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  const validId = '123e4567-e89b-12d3-a456-426614174000';
  const nonExistentId = '456e7890-e89b-12d3-a456-426614174111';

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindFarmByIdUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindFarmByIdUseCase>(FindFarmByIdUseCase);
    repository = module.get(FarmsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return farm when found by valid ID', async () => {
    repository.findById.mockResolvedValue(mockFarm);

    const result = await useCase.execute(validId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
    expect(result).toEqual(mockFarm);
  });

  it('should throw NotFoundException when farm is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(
      new NotFoundException('Fazenda não encontrada'),
    );

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validId)).rejects.toThrow(repositoryError);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
  });

  it('should call repository.findById exactly once', async () => {
    repository.findById.mockResolvedValue(mockFarm);

    await useCase.execute(validId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
  });

  it('should handle empty string ID correctly', async () => {
    const emptyId = '';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(emptyId)).rejects.toThrow(
      new NotFoundException('Fazenda não encontrada'),
    );

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(emptyId);
  });

  it('should handle different farm data correctly', async () => {
    const differentFarm: Farm = {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Fazenda Sol Nascente',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalAreaHectares: 2500.75,
      arableAreaHectares: 2000.5,
      vegetationAreaHectares: 500.25,
      producerId: '789e0123-e89b-12d3-a456-426614174333',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-07-10'),
    };

    repository.findById.mockResolvedValue(differentFarm);

    const result = await useCase.execute(differentFarm.id);

    expect(repository.findById).toHaveBeenCalledWith(differentFarm.id);
    expect(result).toEqual(differentFarm);
    expect(result.name).toBe('Fazenda Sol Nascente');
    expect(result.city).toBe('Ribeirão Preto');
    expect(result.totalAreaHectares).toBe(2500.75);
  });
});
