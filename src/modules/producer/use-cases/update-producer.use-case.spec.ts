import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateProducerUseCase } from './update-producer.use-case';
import { ProducersRepository } from '../repositories/producers.repository';
import { ValidationsDocuments } from '../validators/validations-documents';
import { UpdateProducerDto } from '../dto/update-producer.dto';
import { Producer } from '../entities/producer.entity';

describe('UpdateProducerUseCase', () => {
  let useCase: UpdateProducerUseCase;
  let repository: jest.Mocked<ProducersRepository>;
  let validations: jest.Mocked<ValidationsDocuments>;

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
      ],
    }).compile();

    useCase = module.get<UpdateProducerUseCase>(UpdateProducerUseCase);
    repository = module.get(ProducersRepository);
    validations = module.get(ValidationsDocuments);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a producer successfully when data is valid and cpfCnpj is new', async () => {
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
  });

  it('should update a producer successfully when cpfCnpj is not provided', async () => {
    const updateDtoWithoutCpfCnpj = {
      id: validProducerId,
      name: 'João Silva Atualizado',
    } as UpdateProducerDto;

    repository.findById.mockResolvedValue(mockExistingProducer);
    repository.update.mockResolvedValue(mockUpdatedProducer);

    const result = await useCase.execute(updateDtoWithoutCpfCnpj);

    expect(repository.findById).toHaveBeenCalledWith(
      updateDtoWithoutCpfCnpj.id,
    );
    expect(validations.isValidDocument).not.toHaveBeenCalled();
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(updateDtoWithoutCpfCnpj);
    expect(result).toEqual(mockUpdatedProducer);
  });

  it('should throw NotFoundException when producer does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockUpdateProducerDto)).rejects.toThrow(
      new NotFoundException('Produtor não encontrado'),
    );

    expect(repository.findById).toHaveBeenCalledWith(mockUpdateProducerDto.id);
    expect(validations.isValidDocument).not.toHaveBeenCalled();
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when cpfCnpj format is invalid', async () => {
    const invalidDocumentDto: UpdateProducerDto = {
      id: validProducerId,
      name: 'João Silva',
      cpfCnpj: '12345',
    };

    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(false);

    await expect(useCase.execute(invalidDocumentDto)).rejects.toThrow(
      new ConflictException('Formato de documento inválido'),
    );

    expect(repository.findById).toHaveBeenCalledWith(invalidDocumentDto.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(
      invalidDocumentDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when another producer already has the same cpfCnpj', async () => {
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
  });

  it('should call methods in correct order when cpfCnpj is provided', async () => {
    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.update.mockResolvedValue(mockUpdatedProducer);

    await useCase.execute(mockUpdateProducerDto);

    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(validations.isValidDocument).toHaveBeenCalledTimes(1);
    expect(repository.findByCpfCnpj).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledTimes(1);

    expect(repository.findById).toHaveBeenCalledWith(mockUpdateProducerDto.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(
      mockUpdateProducerDto.cpfCnpj,
    );
    expect(repository.update).toHaveBeenCalledWith(mockUpdateProducerDto);
  });

  it('should propagate repository errors correctly when findById fails', async () => {
    const repositoryError = new Error('Erro de conexão com o banco');
    repository.findById.mockRejectedValue(repositoryError);

    await expect(useCase.execute(mockUpdateProducerDto)).rejects.toThrow(
      repositoryError,
    );

    expect(repository.findById).toHaveBeenCalledWith(mockUpdateProducerDto.id);
    expect(validations.isValidDocument).not.toHaveBeenCalled();
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should propagate repository errors correctly when findByCpfCnpj fails', async () => {
    const repositoryError = new Error('Erro ao buscar por documento');
    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockRejectedValue(repositoryError);

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
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should propagate repository errors correctly when update fails', async () => {
    const repositoryError = new Error('Erro ao atualizar no banco');
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
  });

  it('should work with different types of valid documents', async () => {
    const cnpjDto: UpdateProducerDto = {
      id: validProducerId,
      name: 'Empresa LTDA Atualizada',
      cpfCnpj: '12345678000195',
    };

    const mockUpdatedCompany: Producer = {
      id: validProducerId,
      name: 'Empresa LTDA Atualizada',
      cpfCnpj: '12345678000195',
      createdAt: new Date('2025-07-20'),
      updatedAt: new Date('2025-07-26'),
    };

    repository.findById.mockResolvedValue(mockExistingProducer);
    validations.isValidDocument.mockReturnValue(true);
    repository.findByCpfCnpj.mockResolvedValue(null);
    repository.update.mockResolvedValue(mockUpdatedCompany);

    const result = await useCase.execute(cnpjDto);

    expect(repository.findById).toHaveBeenCalledWith(cnpjDto.id);
    expect(validations.isValidDocument).toHaveBeenCalledWith(cnpjDto.cpfCnpj);
    expect(repository.findByCpfCnpj).toHaveBeenCalledWith(cnpjDto.cpfCnpj);
    expect(repository.update).toHaveBeenCalledWith(cnpjDto);
    expect(result).toEqual(mockUpdatedCompany);
  });

  it('should work with partial updates (only name)', async () => {
    const partialUpdateDto = {
      id: validProducerId,
      name: 'Nome Atualizado',
    } as UpdateProducerDto;

    const mockPartialUpdate: Producer = {
      id: validProducerId,
      name: 'Nome Atualizado',
      cpfCnpj: '12345678901',
      createdAt: new Date('2025-07-20'),
      updatedAt: new Date('2025-07-26'),
    };

    repository.findById.mockResolvedValue(mockExistingProducer);
    repository.update.mockResolvedValue(mockPartialUpdate);

    const result = await useCase.execute(partialUpdateDto);

    expect(repository.findById).toHaveBeenCalledWith(partialUpdateDto.id);
    expect(validations.isValidDocument).not.toHaveBeenCalled();
    expect(repository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(partialUpdateDto);
    expect(result).toEqual(mockPartialUpdate);
  });
});
