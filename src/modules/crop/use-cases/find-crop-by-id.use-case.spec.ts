import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindCropByIdUseCase } from './find-crop-by-id.use-case';
import { CropsRepository } from '../repositories/crops.repository';
import { Crop } from '../entities/crop.entity';

describe('FindCropByIdUseCase', () => {
  let useCase: FindCropByIdUseCase;
  let repository: jest.Mocked<CropsRepository>;

  const mockCrop: Crop = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Soja',
    description: 'Cultivada em regiões tropicais',
    category: 'Grãos',
  };

  const validId = '123e4567-e89b-12d3-a456-426614174000';
  const nonExistentId = '456e7890-e89b-12d3-a456-426614174111';

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCropByIdUseCase,
        {
          provide: CropsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindCropByIdUseCase>(FindCropByIdUseCase);
    repository = module.get(CropsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return crop when found by valid ID', async () => {
    repository.findById.mockResolvedValue(mockCrop);

    const result = await useCase.execute(validId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
    expect(result).toEqual(mockCrop);
  });

  it('should throw NotFoundException when crop is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(
      new NotFoundException('Cultura não encontrada'),
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
    repository.findById.mockResolvedValue(mockCrop);

    await useCase.execute(validId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
  });

  it('should handle empty string ID correctly', async () => {
    const emptyId = '';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(emptyId)).rejects.toThrow(
      new NotFoundException('Cultura não encontrada'),
    );

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(emptyId);
  });

  it('should handle different crop data correctly', async () => {
    const differentCrop: Crop = {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Milho',
      description: 'Cereal amplamente cultivado',
      category: 'Cereais',
    };

    repository.findById.mockResolvedValue(differentCrop);

    const result = await useCase.execute(differentCrop.id);

    expect(repository.findById).toHaveBeenCalledWith(differentCrop.id);
    expect(result).toEqual(differentCrop);
    expect(result.name).toBe('Milho');
    expect(result.category).toBe('Cereais');
  });
});
