import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateProducerUseCase } from './create-producer.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { ValidationsDocuments } from '../validators/validations-documents';
import { CreateProducerDto } from '../dto/create-producer.dto';
import { Producer } from '../entities/producer.entity';

describe('CreateProducerUseCase', () => {
  let useCase: CreateProducerUseCase;
  let repository: jest.Mocked<ProducersRepository>;
  let validations: jest.Mocked<ValidationsDocuments>;

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
      ],
    }).compile();

    useCase = module.get<CreateProducerUseCase>(CreateProducerUseCase);
    repository = module.get(ProducersRepository);
    validations = module.get(ValidationsDocuments);
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
  });
});
