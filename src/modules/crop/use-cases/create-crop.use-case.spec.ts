import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateCropUseCase } from './create-crop.use-case';
import { CropsRepository } from '../repositories/crops.repository';
import { CreateCropDto } from '../dto/create-crop.dto';
import { Crop } from '../entities/crop.entity';

describe('CreateCropUseCase', () => {
  let useCase: CreateCropUseCase;
  let repository: jest.Mocked<CropsRepository>;

  const mockCreateCropDto: CreateCropDto = {
    name: 'Soja',
    description: 'Cultivada em regiões tropicais',
    category: 'Grãos',
  };

  const mockCrop: Crop = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Soja',
    description: 'Cultivada em regiões tropicais',
    category: 'Grãos',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCropUseCase,
        {
          provide: CropsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCropUseCase>(CreateCropUseCase);
    repository = module.get(CropsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a crop successfully when data is valid and crop does not exist', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockCrop);

    const result = await useCase.execute(mockCreateCropDto);

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(mockCreateCropDto);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCrop);
  });

  it('should throw ConflictException when crop with same name already exists', async () => {
    repository.findByName.mockResolvedValue(mockCrop);

    await expect(useCase.execute(mockCreateCropDto)).rejects.toThrow(
      new ConflictException('Cultura já cadastrada'),
    );

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should create a crop with only required fields when crop does not exist', async () => {
    const minimalCropDto: CreateCropDto = {
      name: 'Milho',
    };

    const minimalCrop: Crop = {
      id: '456e7890-e89b-12d3-a456-426614174111',
      name: 'Milho',
      description: null,
      category: null,
    };

    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(minimalCrop);

    const result = await useCase.execute(minimalCropDto);

    expect(repository.findByName).toHaveBeenCalledWith(minimalCropDto.name);
    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(minimalCropDto);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(minimalCrop);
  });

  it('should propagate repository errors correctly when findByName fails', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findByName.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockCreateCropDto)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should propagate repository errors correctly when create fails', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findByName.mockResolvedValue(null);
    repository.create.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockCreateCropDto)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(mockCreateCropDto);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('should work with different crop types when crop does not exist', async () => {
    const frutaCropDto: CreateCropDto = {
      name: 'Maçã',
      description: 'Fruta doce e crocante',
      category: 'Frutas',
    };

    const frutaCrop: Crop = {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Maçã',
      description: 'Fruta doce e crocante',
      category: 'Frutas',
    };

    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(frutaCrop);

    const result = await useCase.execute(frutaCropDto);

    expect(repository.findByName).toHaveBeenCalledWith(frutaCropDto.name);
    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(frutaCropDto);
    expect(result).toEqual(frutaCrop);
  });

  it('should handle crops with long descriptions when crop does not exist', async () => {
    const longDescriptionCropDto: CreateCropDto = {
      name: 'Algodão',
      description:
        'Uma cultura muito importante para a indústria têxtil, cultivada em várias regiões do mundo e conhecida por suas fibras de alta qualidade que são utilizadas na produção de tecidos diversos.',
      category: 'Fibras',
    };

    const longDescriptionCrop: Crop = {
      id: '999e9999-e99b-99d9-a999-999999999999',
      name: 'Algodão',
      description:
        'Uma cultura muito importante para a indústria têxtil, cultivada em várias regiões do mundo e conhecida por suas fibras de alta qualidade que são utilizadas na produção de tecidos diversos.',
      category: 'Fibras',
    };

    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(longDescriptionCrop);

    const result = await useCase.execute(longDescriptionCropDto);

    expect(repository.findByName).toHaveBeenCalledWith(
      longDescriptionCropDto.name,
    );
    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(longDescriptionCropDto);
    expect(result).toEqual(longDescriptionCrop);
  });
});
