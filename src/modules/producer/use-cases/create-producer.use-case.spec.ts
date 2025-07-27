import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateProducerUseCase } from './create-producer.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { ValidationsDocuments } from '../validators/validations-documents';
import { CreateProducerDto } from '../dto/create-producer.dto';
import { Producer } from '../entities/producer.entity';
import { LoggingService } from '@logging/logging.service';

describe('CreateProducerUseCase', () => {
  let useCase: CreateProducerUseCase;
  let repository: jest.Mocked<ProducersRepository>;
  let validations: jest.Mocked<ValidationsDocuments>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockCreateProducerDto: CreateProducerDto = {
    name: 'João Silva',
    cpfCnpj: '12345678901',
  };

  const mockProducer: Producer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    cpfCnpj: '12345678901',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  const mockExistingProducer: Producer = {
    id: '456e7890-e89b-12d3-a456-426614174111',
    name: 'Maria Santos',
    cpfCnpj: '12345678901',
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date('2025-06-20'),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByCpfCnpj: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockValidations = {
      isValidDocument: jest.fn(),
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
        CreateProducerUseCase,
        {
          provide: ProducersRepository,
          useValue: mockRepository,
        },
        {
          provide: ValidationsDocuments,
          useValue: mockValidations,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<CreateProducerUseCase>(CreateProducerUseCase);
    repository = module.get(ProducersRepository);
    validations = module.get(ValidationsDocuments);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a producer successfully when data is valid and document does not exist', async () => {
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockProducer);

    const result = await useCase.execute(mockCreateProducerDto);

    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateProducerDto);
    expect(result).toEqual(mockProducer);

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(4);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateProducerUseCase',
      'Iniciando criação de produtor',
      {
        cpfCnpj: mockCreateProducerDto.cpfCnpj,
        name: mockCreateProducerDto.name,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateProducerUseCase',
      'Documento validado com sucesso',
      { cpfCnpj: mockCreateProducerDto.cpfCnpj },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'CreateProducerUseCase',
      'Verificação de duplicidade concluída - criando produtor',
      { cpfCnpj: mockCreateProducerDto.cpfCnpj },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      4,
      'CreateProducerUseCase',
      'Produtor criado com sucesso',
      {
        producerId: mockProducer.id,
        cpfCnpj: mockProducer.cpfCnpj,
        name: mockProducer.name,
      },
    );

    // Verificar que não houve logs de erro
    expect(loggingService.logValidationError).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when document is invalid', async () => {
    const invalidDocumentDto: CreateProducerDto = {
      name: 'João Silva',
      cpfCnpj: '12345',
    };

    validations.isValidDocument.mockReturnValue(false);

    await expect(useCase.execute(invalidDocumentDto)).rejects.toThrow(
      new ConflictException('Formato de documento inválido'),
    );

    expect(validations.isValidDocument).toHaveBeenCalledWith(
      invalidDocumentDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'CreateProducerUseCase',
      'Iniciando criação de produtor',
      { cpfCnpj: invalidDocumentDto.cpfCnpj, name: invalidDocumentDto.name },
    );

    expect(loggingService.logValidationError).toHaveBeenCalledTimes(1);
    expect(loggingService.logValidationError).toHaveBeenCalledWith(
      'cpfCnpj',
      invalidDocumentDto.cpfCnpj,
      'Formato de documento inválido',
    );
  });

  it('should throw ConflictException when producer already exists with same document', async () => {
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(mockExistingProducer);

    await expect(useCase.execute(mockCreateProducerDto)).rejects.toThrow(
      new ConflictException('Já existe um produtor com este documento'),
    );

    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.create).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateProducerUseCase',
      'Iniciando criação de produtor',
      {
        cpfCnpj: mockCreateProducerDto.cpfCnpj,
        name: mockCreateProducerDto.name,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateProducerUseCase',
      'Documento validado com sucesso',
      { cpfCnpj: mockCreateProducerDto.cpfCnpj },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'CreateProducerUseCase',
      'Tentativa de criar produtor com documento duplicado',
      {
        cpfCnpj: mockCreateProducerDto.cpfCnpj,
        existingProducerId: mockExistingProducer.id,
      },
    );

    expect(loggingService.logValidationError).not.toHaveBeenCalled();
  });

  it('should call methods in correct order', async () => {
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockProducer);

    await useCase.execute(mockCreateProducerDto);

    expect(validations.isValidDocument).toHaveBeenCalledTimes(1);
    expect(repository.findByCpfCnpj).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);

    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateProducerDto);

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando criação de produtor');
    expect(logCalls[1][1]).toBe('Documento validado com sucesso');
    expect(logCalls[2][1]).toBe(
      'Verificação de duplicidade concluída - criando produtor',
    );
    expect(logCalls[3][1]).toBe('Produtor criado com sucesso');
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.create.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockCreateProducerDto)).rejects.toThrow(
      repositoryError,
    );

    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockCreateProducerDto.cpfCnpj,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateProducerDto);

    // Verificar que os logs iniciais foram chamados mesmo com erro
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateProducerUseCase',
      'Iniciando criação de produtor',
      {
        cpfCnpj: mockCreateProducerDto.cpfCnpj,
        name: mockCreateProducerDto.name,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateProducerUseCase',
      'Documento validado com sucesso',
      { cpfCnpj: mockCreateProducerDto.cpfCnpj },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'CreateProducerUseCase',
      'Verificação de duplicidade concluída - criando produtor',
      { cpfCnpj: mockCreateProducerDto.cpfCnpj },
    );
  });

  it('should work with different types of valid documents', async () => {
    const cnpjDto: CreateProducerDto = {
      name: 'Empresa LTDA',
      cpfCnpj: '12345678000195',
    };

    const mockCompanyProducer: Producer = {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Empresa LTDA',
      cpfCnpj: '12345678000195',
      createdAt: new Date('2025-07-26'),
      updatedAt: new Date('2025-07-26'),
    };

    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockCompanyProducer);

    const result = await useCase.execute(cnpjDto);

    expect(validations.isValidDocument).toHaveBeenCalledWith(cnpjDto.cpfCnpj);
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(cnpjDto.cpfCnpj);
    expect(repository.create).toHaveBeenCalledWith(cnpjDto);
    expect(result).toEqual(mockCompanyProducer);

    // Verificar logs específicos para CNPJ
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(4);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateProducerUseCase',
      'Iniciando criação de produtor',
      { cpfCnpj: cnpjDto.cpfCnpj, name: cnpjDto.name },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      4,
      'CreateProducerUseCase',
      'Produtor criado com sucesso',
      {
        producerId: mockCompanyProducer.id,
        cpfCnpj: mockCompanyProducer.cpfCnpj,
        name: mockCompanyProducer.name,
      },
    );
  });

  it('should log validation error with correct field name and value', async () => {
    const invalidDto: CreateProducerDto = {
      name: 'Test User',
      cpfCnpj: 'invalid-document',
    };

    validations.isValidDocument.mockReturnValue(false);

    await expect(useCase.execute(invalidDto)).rejects.toThrow(
      ConflictException,
    );

    expect(loggingService.logValidationError).toHaveBeenCalledWith(
      'cpfCnpj',
      'invalid-document',
      'Formato de documento inválido',
    );
  });

  it('should log all business logic steps in successful flow', async () => {
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockProducer);

    await useCase.execute(mockCreateProducerDto);

    const expectedLogMessages = [
      'Iniciando criação de produtor',
      'Documento validado com sucesso',
      'Verificação de duplicidade concluída - criando produtor',
      'Produtor criado com sucesso',
    ];

    expectedLogMessages.forEach((message, index) => {
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        index + 1,
        'CreateProducerUseCase',
        message,
        expect.any(Object),
      );
    });
  });
});
