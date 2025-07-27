import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindProducerByIdUseCase } from './find-producer-by-id.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';
import { LoggingService } from '@logging/logging.service';

describe('FindProducerByIdUseCase', () => {
  let useCase: FindProducerByIdUseCase;
  let repository: jest.Mocked<ProducersRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockProducer: Producer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    cpfCnpj: '12345678901',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  const validProducerId = '123e4567-e89b-12d3-a456-426614174000';
  const invalidProducerId = '456e7890-e89b-12d3-a456-426614174111';

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByCpfCnpj: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
        FindProducerByIdUseCase,
        {
          provide: ProducersRepository,
          useValue: mockRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<FindProducerByIdUseCase>(FindProducerByIdUseCase);
    repository = module.get(ProducersRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a producer when found by valid ID', async () => {
    repository.findById.mockResolvedValue(mockProducer);

    const result = await useCase.execute(validProducerId);

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(result).toEqual(mockProducer);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindProducerByIdUseCase',
      'Iniciando busca de produtor por ID',
      { producerId: validProducerId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindProducerByIdUseCase',
      'Produtor encontrado com sucesso',
      {
        producerId: mockProducer.id,
        producerName: mockProducer.name,
        producerCpfCnpj: mockProducer.cpfCnpj,
      },
    );
  });

  it('should throw NotFoundException when producer is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidProducerId)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidProducerId);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindProducerByIdUseCase',
      'Iniciando busca de produtor por ID',
      { producerId: invalidProducerId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindProducerByIdUseCase',
      'Produtor não encontrado',
      { producerId: invalidProducerId },
    );
  });

  it('should call repository method exactly once', async () => {
    repository.findById.mockResolvedValue(mockProducer);

    await useCase.execute(validProducerId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validProducerId)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);

    // Verificar que apenas o log inicial foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'FindProducerByIdUseCase',
      'Iniciando busca de produtor por ID',
      { producerId: validProducerId },
    );
  });

  it('should log correct producer information when found', async () => {
    const differentProducer: Producer = {
      id: '999e8888-e89b-12d3-a456-426614174999',
      name: 'Maria Santos',
      cpfCnpj: '98765432100',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-06-15'),
    };

    repository.findById.mockResolvedValue(differentProducer);

    const result = await useCase.execute(differentProducer.id);

    expect(result).toEqual(differentProducer);

    // Verificar se os dados corretos foram logados
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindProducerByIdUseCase',
      'Produtor encontrado com sucesso',
      {
        producerId: differentProducer.id,
        producerName: differentProducer.name,
        producerCpfCnpj: differentProducer.cpfCnpj,
      },
    );
  });

  it('should log the exact ID that was searched for', async () => {
    const searchId = 'unique-test-id-12345';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(searchId)).rejects.toThrow(NotFoundException);

    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindProducerByIdUseCase',
      'Iniciando busca de produtor por ID',
      { producerId: searchId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindProducerByIdUseCase',
      'Produtor não encontrado',
      { producerId: searchId },
    );
  });
});
