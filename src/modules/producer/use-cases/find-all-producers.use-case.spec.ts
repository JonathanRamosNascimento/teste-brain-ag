import { Test, TestingModule } from '@nestjs/testing';
import { FindAllProducersUseCase } from './find-all-producers.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';

describe('FindAllProducersUseCase', () => {
  let useCase: FindAllProducersUseCase;
  let repository: jest.Mocked<ProducersRepository>;

  const mockProducers: Producer[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'João Silva',
      cpfCnpj: '12345678901',
      createdAt: new Date('2025-07-01'),
      updatedAt: new Date('2025-07-01'),
    },
    {
      id: '456e7890-e89b-12d3-a456-426614174111',
      name: 'Maria Santos',
      cpfCnpj: '98765432100',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-06-15'),
    },
    {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Empresa LTDA',
      cpfCnpj: '12345678000195',
      createdAt: new Date('2025-07-10'),
      updatedAt: new Date('2025-07-10'),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllProducersUseCase,
        {
          provide: ProducersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllProducersUseCase>(FindAllProducersUseCase);
    repository = module.get(ProducersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all producers when repository has data', async () => {
    repository.findAll.mockResolvedValue(mockProducers);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
    expect(result).toEqual(mockProducers);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no producers exist', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findAll.mockRejectedValue(repositoryError);

    await expect(useCase.execute()).rejects.toThrow(repositoryError);

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  it('should call repository.findAll exactly once', async () => {
    repository.findAll.mockResolvedValue(mockProducers);

    await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  it('should work with single producer in array', async () => {
    const singleProducer = [mockProducers[0]];
    repository.findAll.mockResolvedValue(singleProducer);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(singleProducer);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockProducers[0]);
  });
});
