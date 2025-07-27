import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateProducerUseCase } from './update-producer.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { ValidationsDocuments } from '../validators/validations-documents';
import { UpdateProducerDto } from '../dto/update-producer.dto';
import { Producer } from '../entities/producer.entity';
import { LoggingService } from '@logging/logging.service';

describe('UpdateProducerUseCase', () => {
  let useCase: UpdateProducerUseCase;
  let repository: jest.Mocked<ProducersRepository>;
  let validations: jest.Mocked<ValidationsDocuments>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockUpdateProducerDto: UpdateProducerDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva Atualizado',
    cpfCnpj: '98765432100',
  };

  const mockExistingProducer: Producer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    cpfCnpj: '12345678901',
    createdAt: new Date('2025-07-20'),
    updatedAt: new Date('2025-07-20'),
  };

  const mockUpdatedProducer: Producer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva Atualizado',
    cpfCnpj: '98765432100',
    createdAt: new Date('2025-07-20'),
    updatedAt: new Date('2025-07-26'),
  };

  const mockAnotherProducer: Producer = {
    id: '456e7890-e89b-12d3-a456-426614174111',
    name: 'Maria Santos',
    cpfCnpj: '98765432100',
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-06-25'),
  };

  const validProducerId = '123e4567-e89b-12d3-a456-426614174000';

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
        UpdateProducerUseCase,
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

    useCase = module.get<UpdateProducerUseCase>(UpdateProducerUseCase);
    repository = module.get(ProducersRepository);
    validations = module.get(ValidationsDocuments);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a producer successfully with valid data', async () => {
    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.update.mockResolvedValue(mockUpdatedProducer);

    const result = await useCase.execute(mockUpdateProducerDto);

    expect(repository.findById).toHaveBeenCalledWith(mockUpdateProducerDto.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.update).toHaveBeenCalledWith(mockUpdateProducerDto);
    expect(result).toEqual(mockUpdatedProducer);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(6);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'UpdateProducerUseCase',
      'Iniciando atualização de produtor',
      {
        producerId: mockUpdateProducerDto.id,
        updateData: {
          name: mockUpdateProducerDto.name,
          cpfCnpj: mockUpdateProducerDto.cpfCnpj,
        },
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'UpdateProducerUseCase',
      'Produtor encontrado para atualização',
      {
        producerId: mockUpdateProducerDto.id,
        currentName: mockExistingProducer.name,
        currentCpfCnpj: mockExistingProducer.cpfCnpj,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      6,
      'UpdateProducerUseCase',
      'Produtor atualizado com sucesso',
      {
        producerId: mockUpdatedProducer.id,
        updatedName: mockUpdatedProducer.name,
        updatedCpfCnpj: mockUpdatedProducer.cpfCnpj,
      },
    );
  });

  it('should throw NotFoundException when producer does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockUpdateProducerDto)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledWith(mockUpdateProducerDto.id);
    expect(repository.update).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'UpdateProducerUseCase',
      'Iniciando atualização de produtor',
      {
        producerId: mockUpdateProducerDto.id,
        updateData: {
          name: mockUpdateProducerDto.name,
          cpfCnpj: mockUpdateProducerDto.cpfCnpj,
        },
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'UpdateProducerUseCase',
      'Tentativa de atualizar produtor inexistente',
      { producerId: mockUpdateProducerDto.id },
    );
  });

  it('should throw ConflictException when document format is invalid', async () => {
    const invalidDto: UpdateProducerDto = {
      id: validProducerId,
      name: 'João Silva',
      cpfCnpj: '12345',
    };

    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(false);

    await expect(useCase.execute(invalidDto)).rejects.toThrow(
      new ConflictException('Formato de documento inválido'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidDto.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(
      invalidDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);
    expect(loggingService.logValidationError).toHaveBeenCalledTimes(1);
    expect(loggingService.logValidationError).toHaveBeenCalledWith(
      'cpfCnpj',
      invalidDto.cpfCnpj,
      'Formato de documento inválido',
    );
  });

  it('should throw ConflictException when document already exists for another producer', async () => {
    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(mockAnotherProducer);

    await expect(useCase.execute(mockUpdateProducerDto)).rejects.toThrow(
      new ConflictException('Já existe um produtor com este documento'),
    );

    expect(repository.findById).toHaveBeenCalledWith(mockUpdateProducerDto.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.update).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(5);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      5,
      'UpdateProducerUseCase',
      'Tentativa de atualizar com documento duplicado',
      {
        producerId: mockUpdateProducerDto.id,
        cpfCnpj: mockUpdateProducerDto.cpfCnpj,
        existingProducerId: mockAnotherProducer.id,
      },
    );
  });

  it('should update producer without changing document when cpfCnpj is not provided', async () => {
    const dtoWithoutCpfCnpj: UpdateProducerDto = {
      id: validProducerId,
      name: 'João Silva Novo Nome',
    };

    const updatedProducerWithoutCpfCnpj: Producer = {
      ...mockExistingProducer,
      name: 'João Silva Novo Nome',
      updatedAt: new Date('2025-07-26'),
    };

    repository.findById.mockResolvedValue(mockExistingProducer);
    repository.update.mockResolvedValue(updatedProducerWithoutCpfCnpj);

    const result = await useCase.execute(dtoWithoutCpfCnpj);

    expect(repository.findById).toHaveBeenCalledWith(dtoWithoutCpfCnpj.id);
    expect(validations.isValidDocument).not.toHaveBeenCalled();
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(dtoWithoutCpfCnpj);
    expect(result).toEqual(updatedProducerWithoutCpfCnpj);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(4);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'UpdateProducerUseCase',
      'Atualizando produtor sem alteração de documento',
      { producerId: dtoWithoutCpfCnpj.id },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      4,
      'UpdateProducerUseCase',
      'Produtor atualizado com sucesso',
      {
        producerId: updatedProducerWithoutCpfCnpj.id,
        updatedName: updatedProducerWithoutCpfCnpj.name,
        updatedCpfCnpj: updatedProducerWithoutCpfCnpj.cpfCnpj,
      },
    );
  });

  it('should allow updating producer with same document', async () => {
    const dtoWithSameDocument: UpdateProducerDto = {
      id: mockExistingProducer.id,
      name: 'João Silva Atualizado',
      cpfCnpj: mockExistingProducer.cpfCnpj,
    };

    const updatedProducerSameDoc: Producer = {
      ...mockExistingProducer,
      name: 'João Silva Atualizado',
      updatedAt: new Date('2025-07-26'),
    };

    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(mockExistingProducer);
    repository.update.mockResolvedValue(updatedProducerSameDoc);

    const result = await useCase.execute(dtoWithSameDocument);

    expect(repository.findById).toHaveBeenCalledWith(dtoWithSameDocument.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(
      dtoWithSameDocument.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      dtoWithSameDocument.cpfCnpj,
    );
    expect(repository.update).toHaveBeenCalledWith(dtoWithSameDocument);
    expect(result).toEqual(updatedProducerSameDoc);

    // Verificar que não há log de documento duplicado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(6);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      5,
      'UpdateProducerUseCase',
      'Verificação de duplicidade concluída - atualizando produtor',
      {
        producerId: dtoWithSameDocument.id,
        cpfCnpj: dtoWithSameDocument.cpfCnpj,
      },
    );
  });

  it('should call methods in correct order for complete update', async () => {
    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.update.mockResolvedValue(mockUpdatedProducer);

    await useCase.execute(mockUpdateProducerDto);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(validations.isValidDocument).toHaveBeenCalledTimes(1);
    expect(repository.findByCpfCnpj).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledTimes(1);

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando atualização de produtor');
    expect(logCalls[1][1]).toBe('Produtor encontrado para atualização');
    expect(logCalls[2][1]).toBe('Validando novo documento');
    expect(logCalls[3][1]).toBe(
      'Documento validado com sucesso - verificando duplicidade',
    );
    expect(logCalls[4][1]).toBe(
      'Verificação de duplicidade concluída - atualizando produtor',
    );
    expect(logCalls[5][1]).toBe('Produtor atualizado com sucesso');
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.update.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockUpdateProducerDto)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findById).toHaveBeenCalledWith(mockUpdateProducerDto.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.update).toHaveBeenCalledWith(mockUpdateProducerDto);

    // Verificar que os logs foram chamados até o ponto do erro
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(5);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      5,
      'UpdateProducerUseCase',
      'Verificação de duplicidade concluída - atualizando produtor',
      {
        producerId: mockUpdateProducerDto.id,
        cpfCnpj: mockUpdateProducerDto.cpfCnpj,
      },
    );
  });
});
