import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteProducerUseCase } from './delete-producer.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { Producer } from '../entities/producer.entity';

describe('DeleteProducerUseCase', () => {
  let useCase: DeleteProducerUseCase;
  let repository: jest.Mocked<ProducersRepository>;

  const mockProducer: Producer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    cpfCnpj: '12345678901',
    createdAt: new Date('2025-07-25'),
    updatedAt: new Date('2025-07-25'),
  };

  const validProducerId = '123e4567-e89b-12d3-a456-426614174000';
  const invalidProducerId = '999e9999-e99b-99d9-a999-999999999999';

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
        DeleteProducerUseCase,
        {
          provide: ProducersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteProducerUseCase>(DeleteProducerUseCase);
    repository = module.get(ProducersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a producer successfully when producer exists', async () => {
    repository.findById.mockResolvedValue(mockProducer);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(validProducerId);

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).toHaveBeenCalledWith(validProducerId);
  });

  it('should throw NotFoundException when producer does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidProducerId)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidProducerId);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should call methods in correct order', async () => {
    repository.findById.mockResolvedValue(mockProducer);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(validProducerId);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.delete).toHaveBeenCalledTimes(1);

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).toHaveBeenCalledWith(validProducerId);
  });

  it('should propagate repository errors correctly when findById fails', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validProducerId)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should propagate repository errors correctly when delete fails', async () => {
    const repositoryError = new Error('Erro ao deletar do banco');
    repository.findById.mockResolvedValue(mockProducer);
    repository.delete.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validProducerId)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findById).toHaveBeenCalledWith(validProducerId);
    expect(repository.delete).toHaveBeenCalledWith(validProducerId);
  });

  it('should not call delete when producer is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(invalidProducerId)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidProducerId);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should work with different valid producer IDs', async () => {
    const anotherValidId = '456e7890-e89b-12d3-a456-426614174111';
    const anotherMockProducer: Producer = {
      id: anotherValidId,
      name: 'Maria Santos',
      cpfCnpj: '98765432100',
      createdAt: new Date('2025-07-15'),
      updatedAt: new Date('2025-07-15'),
    };

    repository.findById.mockResolvedValue(anotherMockProducer);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(anotherValidId);

    expect(repository.findById).toHaveBeenCalledWith(anotherValidId);
    expect(repository.delete).toHaveBeenCalledWith(anotherValidId);
  });
});
