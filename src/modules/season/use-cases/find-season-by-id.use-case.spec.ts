import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindSeasonByIdUseCase } from './find-season-by-id.use-case';
import { SeasonsRepository } from '../repositories/seasons.repository';
import { Season } from '../entities/season.entity';
import { LoggingService } from '@logging/logging.service';

describe('FindSeasonByIdUseCase', () => {
  let useCase: FindSeasonByIdUseCase;
  let repository: jest.Mocked<SeasonsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockSeason: Season = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Safra 2024',
    year: 2024,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    active: true,
  };

  const validId = '123e4567-e89b-12d3-a456-426614174000';
  const nonExistentId = '456e7890-e89b-12d3-a456-426614174111';

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
      logHttpRequest: jest.fn(),
      logHttpResponse: jest.fn(),
      logDatabaseOperation: jest.fn(),
      logApplicationStart: jest.fn(),
      logApplicationShutdown: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindSeasonByIdUseCase,
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

    useCase = module.get<FindSeasonByIdUseCase>(FindSeasonByIdUseCase);
    repository = module.get(SeasonsRepository);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when season is found', () => {
    it('should return season and log the correct business logic events', async () => {
      repository.findById.mockResolvedValue(mockSeason);

      const result = await useCase.execute(validId);

      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockSeason);

      // Verifica logs de início da busca
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        1,
        'FindSeasonByIdUseCase',
        'Iniciando busca de safra por ID',
        { seasonId: validId },
      );

      // Verifica logs de sucesso
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        2,
        'FindSeasonByIdUseCase',
        'Safra encontrada com sucesso',
        {
          seasonId: mockSeason.id,
          seasonName: mockSeason.name,
          seasonYear: mockSeason.year,
        },
      );

      expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    });
  });

  describe('when season is not found', () => {
    it('should throw NotFoundException and log the correct business logic events', async () => {
      repository.findById.mockResolvedValue(null);

      const promise = useCase.execute(nonExistentId);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Safra não encontrada');

      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).toHaveBeenCalledWith(nonExistentId);

      // Verifica logs de início da busca
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        1,
        'FindSeasonByIdUseCase',
        'Iniciando busca de safra por ID',
        { seasonId: nonExistentId },
      );

      // Verifica logs de safra não encontrada
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        2,
        'FindSeasonByIdUseCase',
        'Safra não encontrada',
        { seasonId: nonExistentId },
      );

      expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    });

    it('should handle null season correctly with proper logging', async () => {
      repository.findById.mockResolvedValue(null);

      const promise = useCase.execute(validId);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Safra não encontrada');

      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).toHaveBeenCalledWith(validId);

      // Verifica que o log de início foi chamado
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        1,
        'FindSeasonByIdUseCase',
        'Iniciando busca de safra por ID',
        { seasonId: validId },
      );

      // Verifica que o log de safra não encontrada foi chamado
      expect(loggingService.logBusinessLogic).toHaveBeenNthCalledWith(
        2,
        'FindSeasonByIdUseCase',
        'Safra não encontrada',
        { seasonId: validId },
      );

      expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(2);
    });
  });

  describe('when repository throws an error', () => {
    it('should propagate the error and log only the initial business logic event', async () => {
      const error = new Error('Database connection error');
      repository.findById.mockRejectedValue(error);

      await expect(useCase.execute(validId)).rejects.toThrow(error);

      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).toHaveBeenCalledWith(validId);

      // Verifica que apenas o log de início foi chamado (antes do erro)
      expect(loggingService.logBusinessLogic).toHaveBeenCalledTimes(1);
      expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
        'FindSeasonByIdUseCase',
        'Iniciando busca de safra por ID',
        { seasonId: validId },
      );
    });
  });

  describe('logging service integration', () => {
    it('should call logBusinessLogic with correct parameters for successful flow', async () => {
      repository.findById.mockResolvedValue(mockSeason);

      await useCase.execute(validId);

      expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
        expect.stringMatching(/FindSeasonByIdUseCase/),
        expect.stringMatching(/Iniciando busca de safra por ID/),
        expect.objectContaining({ seasonId: validId }),
      );

      expect(loggingService.logBusinessLogic).toHaveBeenCalledWith(
        expect.stringMatching(/FindSeasonByIdUseCase/),
        expect.stringMatching(/Safra encontrada com sucesso/),
        expect.objectContaining({
          seasonId: mockSeason.id,
          seasonName: mockSeason.name,
          seasonYear: mockSeason.year,
        }),
      );
    });

    it('should not call other logging methods during normal execution', async () => {
      repository.findById.mockResolvedValue(mockSeason);

      await useCase.execute(validId);

      expect(loggingService.log).not.toHaveBeenCalled();
      expect(loggingService.error).not.toHaveBeenCalled();
      expect(loggingService.warn).not.toHaveBeenCalled();
      expect(loggingService.debug).not.toHaveBeenCalled();
      expect(loggingService.verbose).not.toHaveBeenCalled();
      expect(loggingService.logValidationError).not.toHaveBeenCalled();
    });
  });
});
