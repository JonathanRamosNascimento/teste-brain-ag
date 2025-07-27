import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateSeasonUseCase } from './create-season.use-case';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { Season } from '../entities/season.entity';
import { LoggingService } from '@logging/logging.service';

describe('CreateSeasonUseCase', () => {
  let useCase: CreateSeasonUseCase;
  let repository: jest.Mocked<SeasonsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockCreateSeasonDto: CreateSeasonDto = {
    name: 'Safra 2024',
    year: 2024,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    active: true,
  };

  const mockSeason: Season = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Safra 2024',
    year: 2024,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    active: true,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByNameAndYear: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
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
        CreateSeasonUseCase,
        {
          provide: SeasonsRepository,
          useValue: mockRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    useCase = module.get<CreateSeasonUseCase>(CreateSeasonUseCase);
    repository = module.get(SeasonsRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a season successfully when data is valid', async () => {
    repository.findByNameAndYear.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockSeason);

    const result = await useCase.execute(mockCreateSeasonDto);

    // Verificar chamadas do repositório
    expect(repository.findByNameAndYear).toHaveBeenCalledWith(
      mockCreateSeasonDto.name,
      mockCreateSeasonDto.year,
    );
    expect(repository.findByNameAndYear).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(mockCreateSeasonDto);
    expect(repository.create).toHaveBeenCalledTimes(1);

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(3);

    // Log de início
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateSeasonUseCase',
      'Iniciando criação de safra',
      { name: mockCreateSeasonDto.name, year: mockCreateSeasonDto.year },
    );

    // Log após verificação de duplicidade
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateSeasonUseCase',
      'Verificação de duplicidade concluída - criando safra',
      { name: mockCreateSeasonDto.name, year: mockCreateSeasonDto.year },
    );

    // Log de sucesso
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      3,
      'CreateSeasonUseCase',
      'Safra criada com sucesso',
      {
        seasonId: mockSeason.id,
        name: mockSeason.name,
        year: mockSeason.year,
      },
    );

    expect(result).toEqual(mockSeason);
  });

  it('should throw ConflictException when season with same name and year already exists', async () => {
    repository.findByNameAndYear.mockResolvedValue(mockSeason);

    const promise = useCase.execute(mockCreateSeasonDto);

    await expect(promise).rejects.toThrow(ConflictException);
    await expect(promise).rejects.toThrow(
      'Safras com o mesmo nome e ano já existem',
    );

    // Verificar chamadas do repositório
    expect(repository.findByNameAndYear).toHaveBeenCalledWith(
      mockCreateSeasonDto.name,
      mockCreateSeasonDto.year,
    );
    expect(repository.findByNameAndYear).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();

    // Verificar logs de negócio
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);

    // Log de início
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateSeasonUseCase',
      'Iniciando criação de safra',
      { name: mockCreateSeasonDto.name, year: mockCreateSeasonDto.year },
    );

    // Log de duplicidade detectada
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateSeasonUseCase',
      'Tentativa de criar safra com nome e ano duplicados',
      {
        name: mockCreateSeasonDto.name,
        year: mockCreateSeasonDto.year,
        existingSeasonId: mockSeason.id,
      },
    );
  });

  it('should handle creation error correctly', async () => {
    const error = new Error('Database error');
    repository.findByNameAndYear.mockResolvedValue(null);
    repository.create.mockRejectedValue(error);

    await expect(useCase.execute(mockCreateSeasonDto)).rejects.toThrow(error);

    // Verificar chamadas do repositório
    expect(repository.findByNameAndYear).toHaveBeenCalledWith(
      mockCreateSeasonDto.name,
      mockCreateSeasonDto.year,
    );
    expect(repository.create).toHaveBeenCalledWith(mockCreateSeasonDto);

    // Verificar logs de negócio até o ponto do erro
    expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);

    // Log de início
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      1,
      'CreateSeasonUseCase',
      'Iniciando criação de safra',
      { name: mockCreateSeasonDto.name, year: mockCreateSeasonDto.year },
    );

    // Log após verificação de duplicidade
    expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
      2,
      'CreateSeasonUseCase',
      'Verificação de duplicidade concluída - criando safra',
      { name: mockCreateSeasonDto.name, year: mockCreateSeasonDto.year },
    );
  });
});
