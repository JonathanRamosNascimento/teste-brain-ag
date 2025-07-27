import { Test, TestingModule } from '@nestjs/testing';
import { FindAllProducersUseCase } from './find-all-producers.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';
import { LoggingService } from '@logging/logging.service';

describe('FindAllProducersUseCase', () => {
  let useCase: FindAllProducersUseCase;
  let repository: jest.Mocked<ProducersRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockProducers: Producer[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'João Silva',
      cpfCnpj: '12345678901',
      createdAt: new Date('2025-07-26'),
      updatedAt: new Date('2025-07-26'),
    },
    {
      id: '456e7890-e89b-12d3-a456-426614174111',
      name: 'Maria Santos',
      cpfCnpj: '98765432100',
      createdAt: new Date('2025-07-25'),
      updatedAt: new Date('2025-07-25'),
    },
  ];

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
        FindAllProducersUseCase,
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

    useCase = module.get<FindAllProducersUseCase>(FindAllProducersUseCase);
    repository = module.get(ProducersRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all producers when they exist', async () => {
    repository.findAll.mockResolvedValue(mockProducers);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockProducers);
    expect(result).toHaveLength(2);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindAllProducersUseCase',
      'Iniciando busca de todos os produtores',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindAllProducersUseCase',
      'Busca de produtores concluída',
      { totalProducers: 2 },
    );
  });

  it('should return empty array when no producers exist', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);

    // Verificar logs
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'FindAllProducersUseCase',
      'Iniciando busca de todos os produtores',
      {},
    );
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindAllProducersUseCase',
      'Busca de produtores concluída',
      { totalProducers: 0 },
    );
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findAll.mockRejectedValue(repositoryError);

    await expect(useCase.execute()).rejects.toThrow(repositoryError);

    expect(repository.findAll).toHaveBeenCalledTimes(1);

    // Verificar que apenas o log inicial foi chamado
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
    expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
      'FindAllProducersUseCase',
      'Iniciando busca de todos os produtores',
      {},
    );
  });

  it('should call repository.findAll exactly once', async () => {
    repository.findAll.mockResolvedValue(mockProducers);

    await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  it('should log correct total count for different numbers of producers', async () => {
    const singleProducer = [mockProducers[0]];
    repository.findAll.mockResolvedValue(singleProducer);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);

    // Verificar que o total correto foi logado
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindAllProducersUseCase',
      'Busca de produtores concluída',
      { totalProducers: 1 },
    );
  });

  it('should handle large number of producers correctly', async () => {
    const manyProducers = Array.from({ length: 100 }, (_, index) => ({
      id: `id-${index}`,
      name: `Producer ${index}`,
      cpfCnpj: `${index.toString().padStart(11, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    repository.findAll.mockResolvedValue(manyProducers);

    const result = await useCase.execute();

    expect(result).toHaveLength(100);

    // Verificar que o total correto foi logado
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'FindAllProducersUseCase',
      'Busca de produtores concluída',
      { totalProducers: 100 },
    );
  });

  it('should maintain order of logs', async () => {
    repository.findAll.mockResolvedValue(mockProducers);

    await useCase.execute();

    // Verificar ordem dos logs
    const logCalls = loggingService.logBusinessLogic.mock.calls;
    expect(logCalls[0][1]).toBe('Iniciando busca de todos os produtores');
    expect(logCalls[1][1]).toBe('Busca de produtores concluída');
  });
});
