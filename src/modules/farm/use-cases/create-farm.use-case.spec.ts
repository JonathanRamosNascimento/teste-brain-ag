import { Producer } from '@modules/producer/entities/producer.entity';
import { FindProducerById } from '@modules/producer/use-cases/abstractions/find-producer-by-id.abstraction';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateFarmDto } from '../dto/create-farm.dto';
import { Farm } from '../entities/farm.entity';
import { FarmsRepository } from '../repositories/farms.repository';
import { ValidationArea } from '../validators/validation-area';
import { CreateFarmUseCase } from './create-farm.use-case';
import { LoggingService } from '@logging/logging.service';

describe('CreateFarmUseCase', () => {
  let useCase: CreateFarmUseCase;
  let repository: jest.Mocked<FarmsRepository>;
  let validations: jest.Mocked<ValidationArea>;
  let findProducerById: jest.Mocked<FindProducerById>;
  let loggingService: jest.Mocked<LoggingService>;

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
      count: jest.fn(),
      totalAreaHectares: jest.fn(),
      farmsByState: jest.fn(),
      landUsage: jest.fn(),
      findFarmsByCrop: jest.fn(),
    };

    const mockValidations = {
      validFarmAreas: jest.fn(),
    };

    const mockFindProducerById = {
      execute: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logBusinessLogic: jest.fn(),
      logValidationError: jest.fn(),
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
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<CreateFarmUseCase>(CreateFarmUseCase);
    repository = module.get(FarmsRepository);
    validations = module.get(ValidationArea);
    findProducerById = module.get(FindProducerById);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a farm successfully when data is valid', async () => {
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

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(5);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateFarmUseCase',
      'Iniciando criação de fazenda',
      {
        producerId: mockCreateFarmDto.producerId,
        farmName: mockCreateFarmDto.name,
        totalArea: mockCreateFarmDto.totalAreaHectares,
        arableArea: mockCreateFarmDto.arableAreaHectares,
        vegetationArea: mockCreateFarmDto.vegetationAreaHectares,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      5,
      'CreateFarmUseCase',
      'Fazenda criada com sucesso',
      {
        farmId: mockFarm.id,
        farmName: mockFarm.name,
        producerId: mockFarm.producerId,
        totalArea: mockFarm.totalAreaHectares,
        state: mockFarm.state,
        city: mockFarm.city,
      },
    );
  });

  it('should throw NotFoundException when producer does not exist', async () => {
    findProducerById.execute.mockRejectedValue(
      new NotFoundException('Produtor não encontrado'),
    );

    await expect(useCase.execute(mockCreateFarmDto)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(findProducerById.execute).toHaveBeenCalledWith(
      mockCreateFarmDto.producerId,
    );
    expect(validations.validFarmAreas).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateFarmUseCase',
      'Iniciando criação de fazenda',
      {
        producerId: mockCreateFarmDto.producerId,
        farmName: mockCreateFarmDto.name,
        totalArea: mockCreateFarmDto.totalAreaHectares,
        arableArea: mockCreateFarmDto.arableAreaHectares,
        vegetationArea: mockCreateFarmDto.vegetationAreaHectares,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateFarmUseCase',
      'Validando existência do produtor',
      { producerId: mockCreateFarmDto.producerId },
    );
  });

  it('should throw ConflictException when farm areas are invalid', async () => {
    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(false);

    await expect(useCase.execute(mockCreateFarmDto)).rejects.toThrow(
      new ConflictException('Áreas da fazenda inválidas'),
    );

    expect(findProducerById.execute).toHaveBeenCalledWith(
      mockCreateFarmDto.producerId,
    );
    expect(validations.validFarmAreas).toHaveBeenCalledWith(
      mockCreateFarmDto.totalAreaHectares,
      mockCreateFarmDto.arableAreaHectares,
      mockCreateFarmDto.vegetationAreaHectares,
    );
    expect(repository.create).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);
    expect(loggingService.logValidationError).toHaveBeenCalledTimes(1);
    expect(loggingService.logValidationError).toHaveBeenCalledWith(
      'farmAreas',
      `total: ${mockCreateFarmDto.totalAreaHectares}, arable: ${mockCreateFarmDto.arableAreaHectares}, vegetation: ${mockCreateFarmDto.vegetationAreaHectares}`,
      'Áreas da fazenda inválidas',
    );
  });

  it('should call methods in correct order', async () => {
    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockResolvedValue(mockFarm);

    await useCase.execute(mockCreateFarmDto);

    expect(findProducerById.execute).toHaveBeenCalledTimes(1);
    expect(validations.validFarmAreas).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando criação de fazenda');
    expect(logCalls[1][1]).toBe('Validando existência do produtor');
    expect(logCalls[2][1]).toBe(
      'Produtor validado com sucesso - validando áreas da fazenda',
    );
    expect(logCalls[3][1]).toBe(
      'Áreas da fazenda validadas com sucesso - criando fazenda',
    );
    expect(logCalls[4][1]).toBe('Fazenda criada com sucesso');
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

    // Verificar que os logs foram chamados até o ponto do erro
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(4);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      4,
      'CreateFarmUseCase',
      'Áreas da fazenda validadas com sucesso - criando fazenda',
      {
        producerId: mockCreateFarmDto.producerId,
        farmName: mockCreateFarmDto.name,
        validatedAreas: {
          total: mockCreateFarmDto.totalAreaHectares,
          arable: mockCreateFarmDto.arableAreaHectares,
          vegetation: mockCreateFarmDto.vegetationAreaHectares,
        },
      },
    );
  });

  it('should log correct producer information when validated', async () => {
    const differentProducer: Producer = {
      id: 'different-producer-id',
      name: 'Maria Santos',
      cpfCnpj: '98765432100',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-06-15'),
    };

    findProducerById.execute.mockResolvedValue(differentProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockResolvedValue(mockFarm);

    await useCase.execute(mockCreateFarmDto);

    // Verificar se os dados corretos do produtor foram logados
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'CreateFarmUseCase',
      'Produtor validado com sucesso - validando áreas da fazenda',
      {
        producerId: differentProducer.id,
        producerName: differentProducer.name,
        totalArea: mockCreateFarmDto.totalAreaHectares,
        arableArea: mockCreateFarmDto.arableAreaHectares,
        vegetationArea: mockCreateFarmDto.vegetationAreaHectares,
      },
    );
  });

  it('should work with different area configurations', async () => {
    const differentFarmDto: CreateFarmDto = {
      name: 'Fazenda do Norte',
      city: 'Brasília',
      state: 'DF',
      totalAreaHectares: 500,
      arableAreaHectares: 300,
      vegetationAreaHectares: 200,
      producerId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const differentFarm: Farm = {
      id: 'different-farm-id',
      name: 'Fazenda do Norte',
      city: 'Brasília',
      state: 'DF',
      totalAreaHectares: 500,
      arableAreaHectares: 300,
      vegetationAreaHectares: 200,
      producerId: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date('2025-07-26'),
      updatedAt: new Date('2025-07-26'),
    };

    findProducerById.execute.mockResolvedValue(mockProducer);
    validations.validFarmAreas.mockReturnValue(true);
    repository.create.mockResolvedValue(differentFarm);

    const result = await useCase.execute(differentFarmDto);

    expect(result).toEqual(differentFarm);

    // Verificar logs específicos para esta fazenda
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateFarmUseCase',
      'Iniciando criação de fazenda',
      {
        producerId: differentFarmDto.producerId,
        farmName: differentFarmDto.name,
        totalArea: differentFarmDto.totalAreaHectares,
        arableArea: differentFarmDto.arableAreaHectares,
        vegetationArea: differentFarmDto.vegetationAreaHectares,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      5,
      'CreateFarmUseCase',
      'Fazenda criada com sucesso',
      {
        farmId: differentFarm.id,
        farmName: differentFarm.name,
        producerId: differentFarm.producerId,
        totalArea: differentFarm.totalAreaHectares,
        state: differentFarm.state,
        city: differentFarm.city,
      },
    );
  });
});
