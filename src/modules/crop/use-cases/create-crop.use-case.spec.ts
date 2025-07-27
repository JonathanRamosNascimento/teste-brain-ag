import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateCropUseCase } from './create-crop.use-case';
import { CropsRepository } from '../repositories/crops.repository';
import { CreateCropDto } from '../dto/create-crop.dto';
import { Crop } from '../entities/crop.entity';
import { LoggingService } from '@logging/logging.service';

describe('CreateCropUseCase', () => {
  let useCase: CreateCropUseCase;
  let repository: jest.Mocked<CropsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

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

  const mockExistingCrop: Crop = {
    id: '456e7890-e89b-12d3-a456-426614174111',
    name: 'Soja',
    description: 'Já existente',
    category: 'Grãos',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
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
        CreateCropUseCase,
        {
          provide: CropsRepository,
          useValue: mockRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<CreateCropUseCase>(CreateCropUseCase);
    repository = module.get(CropsRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a crop successfully when data is valid and crop does not exist', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockCrop);

    const result = await useCase.execute(mockCreateCropDto);

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.create).toHaveBeenCalledWith(mockCreateCropDto);
    expect(result).toEqual(mockCrop);

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateCropUseCase',
      'Iniciando criação de cultura',
      { cropName: mockCreateCropDto.name },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateCropUseCase',
      'Verificação de duplicidade concluída - criando cultura',
      { cropName: mockCreateCropDto.name },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'CreateCropUseCase',
      'Cultura criada com sucesso',
      { cropId: mockCrop.id, cropName: mockCrop.name },
    );
  });

  it('should throw ConflictException when crop already exists', async () => {
    repository.findByName.mockResolvedValue(mockExistingCrop);

    await expect(useCase.execute(mockCreateCropDto)).rejects.toThrow(
      new ConflictException('Cultura já cadastrada'),
    );

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.create).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateCropUseCase',
      'Iniciando criação de cultura',
      { cropName: mockCreateCropDto.name },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateCropUseCase',
      'Tentativa de criar cultura duplicada',
      { cropName: mockCreateCropDto.name, existingCropId: mockExistingCrop.id },
    );
  });

  it('should call methods in correct order', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockCrop);

    await useCase.execute(mockCreateCropDto);

    expect(repository.findByName).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.create).toHaveBeenCalledWith(mockCreateCropDto);

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando criação de cultura');
    expect(logCalls[1][1]).toBe(
      'Verificação de duplicidade concluída - criando cultura',
    );
    expect(logCalls[2][1]).toBe('Cultura criada com sucesso');
  });

  it('should propagate repository errors from findByName correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findByName.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockCreateCropDto)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.create).not.toHaveBeenCalled();

    // Verificar que apenas o log inicial foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'CreateCropUseCase',
      'Iniciando criação de cultura',
      { cropName: mockCreateCropDto.name },
    );
  });

  it('should propagate repository errors from create correctly', async () => {
    const repositoryError = new Error('Erro ao criar no banco');
    repository.findByName.mockResolvedValue(null);
    repository.create.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockCreateCropDto)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findByName).toHaveBeenCalledWith(mockCreateCropDto.name);
    expect(repository.create).toHaveBeenCalledWith(mockCreateCropDto);

    // Verificar que os logs foram chamados até o ponto do erro
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateCropUseCase',
      'Iniciando criação de cultura',
      { cropName: mockCreateCropDto.name },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateCropUseCase',
      'Verificação de duplicidade concluída - criando cultura',
      { cropName: mockCreateCropDto.name },
    );
  });

  it('should work with different types of crops', async () => {
    const milhoDto: CreateCropDto = {
      name: 'Milho',
      description: 'Cereal amplamente cultivado',
      category: 'Cereais',
    };

    const mockMilhoCrop: Crop = {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Milho',
      description: 'Cereal amplamente cultivado',
      category: 'Cereais',
    };

    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockMilhoCrop);

    const result = await useCase.execute(milhoDto);

    expect(repository.findByName).toHaveBeenCalledWith(milhoDto.name);
    expect(repository.create).toHaveBeenCalledWith(milhoDto);
    expect(result).toEqual(mockMilhoCrop);

    // Verificar logs específicos para milho
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateCropUseCase',
      'Iniciando criação de cultura',
      { cropName: milhoDto.name },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'CreateCropUseCase',
      'Cultura criada com sucesso',
      { cropId: mockMilhoCrop.id, cropName: mockMilhoCrop.name },
    );
  });

  it('should log all business logic steps in successful flow', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockCrop);

    await useCase.execute(mockCreateCropDto);

    const expectedLogMessages = [
      'Iniciando criação de cultura',
      'Verificação de duplicidade concluída - criando cultura',
      'Cultura criada com sucesso',
    ];

    expectedLogMessages.forEach((message, index) => {
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        index + 1,
        'CreateCropUseCase',
        message,
        expect.any(Object),
      );
    });
  });

  it('should log correct crop information when duplicated', async () => {
    const existingCropWithDifferentId: Crop = {
      id: 'unique-existing-id-999',
      name: 'Soja',
      description: 'Cultura já existente',
      category: 'Grãos',
    };

    repository.findByName.mockResolvedValue(existingCropWithDifferentId);

    await expect(useCase.execute(mockCreateCropDto)).rejects.toThrow(
      ConflictException,
    );

    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateCropUseCase',
      'Tentativa de criar cultura duplicada',
      {
        cropName: mockCreateCropDto.name,
        existingCropId: existingCropWithDifferentId.id,
      },
    );
  });
});
