import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindProducerByIdUseCase } from './find-producer-by-id.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';

describe('FindProducerByIdUseCase', () => {
  let useCase: FindProducerByIdUseCase;
  let repository: jest.Mocked<ProducersRepository>;

  const mockProducer: Producer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    cpfCnpj: '12345678901',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26'),
  };

  const validId = '123e4567-e89b-12d3-a456-426614174000';
  const nonExistentId = '456e7890-e89b-12d3-a456-426614174111';

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
        FindProducerByIdUseCase,
        {
          provide: ProducersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindProducerByIdUseCase>(FindProducerByIdUseCase);
    repository = module.get(ProducersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return producer when found by valid ID', async () => {
    repository.findById.mockResolvedValue(mockProducer);

    const result = await useCase.execute(validId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
    expect(result).toEqual(mockProducer);
  });

  it('should throw NotFoundException when producer is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
  });

  it('should propagate repository errors correctly', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validId)).rejects.toThrow(repositoryError);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
  });

  it('should call repository.findById exactly once', async () => {
    repository.findById.mockResolvedValue(mockProducer);

    await useCase.execute(validId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(validId);
  });

  it('should handle empty string ID correctly', async () => {
    const emptyId = '';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(emptyId)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(emptyId);
  });

  it('should handle different producer data correctly', async () => {
    const differentProducer: Producer = {
      id: '789e0123-e89b-12d3-a456-426614174222',
      name: 'Empresa LTDA',
      cpfCnpj: '12345678000195',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-07-10'),
    };

    repository.findById.mockResolvedValue(differentProducer);

    const result = await useCase.execute(differentProducer.id);

    expect(repository.findById).toHaveBeenCalledWith(differentProducer.id);
    expect(result).toEqual(differentProducer);
    expect(result.name).toBe('Empresa LTDA');
    expect(result.cpfCnpj).toBe('12345678000195');
  });
});
