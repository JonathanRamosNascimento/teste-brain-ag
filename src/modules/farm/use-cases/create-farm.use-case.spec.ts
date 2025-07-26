import { Producer } from '@modules/producer/entities/producer.entity';
import { FindProducerById } from '@modules/producer/use-cases/abstractions/find-producer-by-id.abstraction';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { Farm } from '../entities/farm.entity';
import { FarmsRepository } from '../repositories/farms.repository';
import { ValidationArea } from '../validators/validation-area';
import { CreateFarmUseCase } from './create-farm.use-case';

describe('CreateFarmUseCase', () => {
  let useCase: CreateFarmUseCase;
  let repository: jest.Mocked<FarmsRepository>;
  let validations: jest.Mocked<ValidationArea>;
  let findProducerById: jest.Mocked<FindProducerById>;

  const mockProducer: Producer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    cpfCnpj: '12345678901',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  const mockCreateFarmDto: CreateFarmDto = {
    name: 'Fazenda Santa Maria',
    city: 'São Paulo',
    state: 'SP',
    totalAreaHectares: 1000,
    arableAreaHectares: 600,
    vegetationAreaHectares: 400,
    producerId: '123e4567-e89b-12d3-a456-426614174000',
  };

  const mockFarm: Farm = {
    id: '456e7890-e89b-12d3-a456-426614174111',
    name: 'Fazenda Santa Maria',
    city: 'São Paulo',
    state: 'SP',
    totalAreaHectares: 1000,
    arableAreaHectares: 600,
    vegetationAreaHectares: 400,
    producerId: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockValidations = {
      validFarmAreas: jest.fn(),
    };

    const mockFindProducerById = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFarmUseCase,
        {
          provide: FarmsRepository,
          useValue: mockRepository,
        },
        {
          provide: ValidationArea,
          useValue: mockValidations,
        },
        {
          provide: FindProducerById,
          useValue: mockFindProducerById,
        },
      ],
    }).compile();

    repository = module.get(FarmsRepository);
    validations = module.get(ValidationArea);
    findProducerById = module.get(FindProducerById);
    useCase = new CreateFarmUseCase(repository, validations, findProducerById);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a farm successfully when data is valid and producer exists', async () => {
    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockResolvedValue(mockFarm);

    const result = await useCase.execute(mockCreateFarmDto);

    expect(findProducerById.execute).toHaveBeenCalledWith(
      mockCreateFarmDto.producerId,
    );
    expect(validations.validFarmAreas).toHaveBeenCalledWith(
      mockCreateFarmDto.totalAreaHectares,
      mockCreateFarmDto.arableAreaHectares,
      mockCreateFarmDto.vegetationAreaHectares,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateFarmDto);
    expect(result).toEqual(mockFarm);
  });

  it('should throw ConflictException when farm areas are invalid', async () => {
    const invalidAreaDto: CreateFarmDto = {
      name: 'Fazenda Teste',
      city: 'São Paulo',
      state: 'SP',
      totalAreaHectares: 1000,
      arableAreaHectares: 700,
      vegetationAreaHectares: 400,
      producerId: '123e4567-e89b-12d3-a456-426614174000',
    };

    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(false);

    await expect(useCase.execute(invalidAreaDto)).rejects.toThrow(
      new ConflictException('Áreas da fazenda inválidas'),
    );

    expect(findProducerById.execute).toHaveBeenCalledWith(
      invalidAreaDto.producerId,
    );
    expect(validations.validFarmAreas).toHaveBeenCalledWith(
      invalidAreaDto.totalAreaHectares,
      invalidAreaDto.arableAreaHectares,
      invalidAreaDto.vegetationAreaHectares,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should propagate error when producer is not found', async () => {
    const notFoundError = new NotFoundException('Produtor não encontrado');
    findProducerById.execute.mockRejectedValue(notFoundError);

    await expect(useCase.execute(mockCreateFarmDto)).rejects.toThrow(
      notFoundError,
    );

    expect(findProducerById.execute).toHaveBeenCalledWith(
      mockCreateFarmDto.producerId,
    );
    expect(validations.validFarmAreas).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should call methods in correct order', async () => {
    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockResolvedValue(mockFarm);

    await useCase.execute(mockCreateFarmDto);

    expect(findProducerById.execute).toHaveBeenCalledTimes(1);
    expect(validations.validFarmAreas).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);

    expect(findProducerById.execute).toHaveBeenCalledWith(
      mockCreateFarmDto.producerId,
    );
    expect(validations.validFarmAreas).toHaveBeenCalledWith(
      mockCreateFarmDto.totalAreaHectares,
      mockCreateFarmDto.arableAreaHectares,
      mockCreateFarmDto.vegetationAreaHectares,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateFarmDto);
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockCreateFarmDto)).rejects.toThrow(
      repositoryError,
    );

    expect(findProducerById.execute).toHaveBeenCalledWith(
      mockCreateFarmDto.producerId,
    );
    expect(validations.validFarmAreas).toHaveBeenCalledWith(
      mockCreateFarmDto.totalAreaHectares,
      mockCreateFarmDto.arableAreaHectares,
      mockCreateFarmDto.vegetationAreaHectares,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateFarmDto);
  });

  it('should work with farms where arable and vegetation areas sum exactly equals total area', async () => {
    const exactAreaDto: CreateFarmDto = {
      name: 'Fazenda Exata',
      city: 'Rio de Janeiro',
      state: 'RJ',
      totalAreaHectares: 1000,
      arableAreaHectares: 600,
      vegetationAreaHectares: 400,
      producerId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const mockExactFarm: Farm = {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Fazenda Exata',
      city: 'Rio de Janeiro',
      state: 'RJ',
      totalAreaHectares: 1000,
      arableAreaHectares: 600,
      vegetationAreaHectares: 400,
      producerId: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date('2025-07-26'),
      updatedAt: new Date('2025-07-26'),
    };

    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockResolvedValue(mockExactFarm);

    const result = await useCase.execute(exactAreaDto);

    expect(validations.validFarmAreas).toHaveBeenCalledWith(
      exactAreaDto.totalAreaHectares,
      exactAreaDto.arableAreaHectares,
      exactAreaDto.vegetationAreaHectares,
    );
    expect(repository.create).toHaveBeenCalledWith(exactAreaDto);
    expect(result).toEqual(mockExactFarm);
  });

  it('should work with different producer IDs', async () => {
    const differentProducerId = '999e8888-e89b-12d3-a456-426614174999';
    const differentProducer: Producer = {
      id: differentProducerId,
      name: 'Maria Santos',
      cpfCnpj: '98765432100',
      createdAt: new Date('2025-07-26'),
      updatedAt: new Date('2025-07-26'),
    };

    const farmWithDifferentProducer: CreateFarmDto = {
      ...mockCreateFarmDto,
      producerId: differentProducerId,
    };

    findProducerById.execute.mockResolvedValue(differentProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockResolvedValue({
      ...mockFarm,
      producerId: differentProducerId,
    });

    const result = await useCase.execute(farmWithDifferentProducer);

    expect(findProducerById.execute).toHaveBeenCalledWith(differentProducerId);
    expect(result.producerId).toBe(differentProducerId);
  });
});
