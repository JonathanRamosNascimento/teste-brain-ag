import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteProducerUseCase } from './delete-producer.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';
import { LoggingService } from '@logging/logging.service';

describe('DeleteProducerUseCase', () => {
  let useCase: DeleteProducerUseCase;
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
        DeleteProducerUseCase,
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

    useCase = module.get<DeleteProducerUseCase>(DeleteProducerUseCase);
    repository = module.get(ProducersRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a producer successfully when found', async () => {
    repository.findById.mockResolvedValue(mockProducer);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(validProducerId);

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).toHaveBeenCalledWith(validProducerId);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'DeleteProducerUseCase',
      'Iniciando exclusão de produtor',
      { producerId: validProducerId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'DeleteProducerUseCase',
      'Produtor encontrado - prosseguindo com exclusão',
      {
        producerId: mockProducer.id,
        producerName: mockProducer.name,
        producerCpfCnpj: mockProducer.cpfCnpj,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'DeleteProducerUseCase',
      'Produtor excluído com sucesso',
      {
        producerId: validProducerId,
        deletedProducerName: mockProducer.name,
        deletedProducerCpfCnpj: mockProducer.cpfCnpj,
      },
    );
  });

  it('should throw NotFoundException when producer is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidProducerId)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidProducerId);
    expect(repository.delete).not.toHaveBeenCalled();

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'DeleteProducerUseCase',
      'Iniciando exclusão de produtor',
      { producerId: invalidProducerId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'DeleteProducerUseCase',
      'Tentativa de excluir produtor inexistente',
      { producerId: invalidProducerId },
    );
  });

  it('should call methods in correct order', async () => {
    repository.findById.mockResolvedValue(mockProducer);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(validProducerId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.delete).toHaveBeenCalledTimes(1);

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).toHaveBeenCalledWith(validProducerId);

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando exclusão de produtor');
    expect(logCalls[1][1]).toBe(
      'Produtor encontrado - prosseguindo com exclusão',
    );
    expect(logCalls[2][1]).toBe('Produtor excluído com sucesso');
  });

  it('should propagate repository errors when findById fails', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validProducerId)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).not.toHaveBeenCalled();

    // Verificar que apenas o log inicial foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'DeleteProducerUseCase',
      'Iniciando exclusão de produtor',
      { producerId: validProducerId },
    );
  });

  it('should propagate repository errors when delete fails', async () => {
    const repositoryError = new Error('Erro ao excluir do banco');
    repository.findById.mockResolvedValue(mockProducer);
    repository.delete.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validProducerId)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).toHaveBeenCalledWith(validProducerId);

    // Verificar que os logs foram chamados até o ponto do erro
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'DeleteProducerUseCase',
      'Iniciando exclusão de produtor',
      { producerId: validProducerId },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'DeleteProducerUseCase',
      'Produtor encontrado - prosseguindo com exclusão',
      {
        producerId: mockProducer.id,
        producerName: mockProducer.name,
        producerCpfCnpj: mockProducer.cpfCnpj,
      },
    );
  });

  it('should log correct producer information during deletion', async () => {
    const differentProducer: Producer = {
      id: '999e8888-e89b-12d3-a456-426614174999',
      name: 'Maria Santos',
      cpfCnpj: '98765432100',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-06-15'),
    };

    repository.findById.mockResolvedValue(differentProducer);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(differentProducer.id);

    // Verificar se os dados corretos foram logados
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'DeleteProducerUseCase',
      'Produtor encontrado - prosseguindo com exclusão',
      {
        producerId: differentProducer.id,
        producerName: differentProducer.name,
        producerCpfCnpj: differentProducer.cpfCnpj,
      },
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'DeleteProducerUseCase',
      'Produtor excluído com sucesso',
      {
        producerId: differentProducer.id,
        deletedProducerName: differentProducer.name,
        deletedProducerCpfCnpj: differentProducer.cpfCnpj,
      },
    );
  });

  it('should return void when deletion is successful', async () => {
    repository.findById.mockResolvedValue(mockProducer);
    repository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute(validProducerId);

    expect(result).toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(validProducerId);
  });
});
