import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('Season Module Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prismaService.season.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.season.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Season creation scenarios', () => {
    it('should create a season successfully with valid data', async () => {
      const createData = {
        name: 'Safra 2024',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData);

      expect(createResponse.statusCode).toBe(201);
      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(createData.name);
      expect(createResponse.body.year).toBe(createData.year);
      expect(createResponse.body.startDate).toBe(createData.startDate);
      expect(createResponse.body.endDate).toBe(createData.endDate);
      expect(createResponse.body.active).toBe(createData.active);
    });

    it('should create a season with only required fields (active defaults to true)', async () => {
      const createData = {
        name: 'Safra 2025',
        year: 2025,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.999Z',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(createData.name);
      expect(createResponse.body.year).toBe(createData.year);
      expect(createResponse.body.active).toBe(true); // Default value
    });

    it('should create multiple seasons successfully', async () => {
      const seasons = [
        {
          name: 'Safra 2024/1',
          year: 2024,
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-06-30T23:59:59.999Z',
          active: true,
        },
        {
          name: 'Safra 2024/2',
          year: 2024,
          startDate: '2024-07-01T00:00:00.000Z',
          endDate: '2024-12-31T23:59:59.999Z',
          active: true,
        },
        {
          name: 'Safra 2025',
          year: 2025,
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T23:59:59.999Z',
          active: false,
        },
      ];

      const createdSeasons: any[] = [];
      for (const season of seasons) {
        const response = await request(app.getHttpServer())
          .post('/seasons')
          .send(season)
          .expect(201);
        createdSeasons.push(response.body);
      }

      expect(createdSeasons).toHaveLength(3);

      seasons.forEach((originalSeason, index) => {
        expect(createdSeasons[index].name).toBe(originalSeason.name);
        expect(createdSeasons[index].year).toBe(originalSeason.year);
        expect(createdSeasons[index].active).toBe(originalSeason.active);
      });

      const seasonsInDb = await prismaService.season.findMany({});
      expect(seasonsInDb).toHaveLength(3);
    });

    it('should return 409 when trying to create season with duplicate name', async () => {
      const createData = {
        name: 'Safra Única',
        year: 2025,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      const duplicateData = {
        name: 'Safra Única',
        year: 2025,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.999Z',
        active: false,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(duplicateData)
        .expect(409);

      const seasonsInDb = await prismaService.season.findMany({});
      expect(seasonsInDb).toHaveLength(1);
    });
  });

  describe('Validation scenarios', () => {
    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        year: 'invalid',
        startDate: 'invalid-date',
        endDate: 'invalid-date',
        active: 'not-boolean',
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Safra Incompleta',
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(incompleteData)
        .expect(400);
    });

    it('should return 400 for invalid year format', async () => {
      const createData = {
        name: 'Safra Ano Inválido',
        year: -2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(400);
    });

    it('should return 400 for non-string name', async () => {
      const invalidData = {
        name: 123,
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for empty name', async () => {
      const createData = {
        name: '',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(400);
    });
  });

  describe('Date logic scenarios', () => {
    it('should create season with startDate before endDate', async () => {
      const createData = {
        name: 'Safra Válida',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      expect(new Date(createResponse.body.startDate).getTime()).toBeLessThan(
        new Date(createResponse.body.endDate).getTime(),
      );
    });

    it('should handle same startDate and endDate', async () => {
      const sameDate = '2024-06-15T12:00:00.000Z';
      const createData = {
        name: 'Safra Um Dia',
        year: 2024,
        startDate: sameDate,
        endDate: sameDate,
        active: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      expect(createResponse.body.startDate).toBe(sameDate);
      expect(createResponse.body.endDate).toBe(sameDate);
    });

    it('should handle different time zones in dates', async () => {
      const createData = {
        name: 'Safra Timezone',
        year: 2024,
        startDate: '2024-01-01T03:00:00.000Z',
        endDate: '2024-12-31T02:59:59.999Z',
        active: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      expect(createResponse.body.startDate).toBe(createData.startDate);
      expect(createResponse.body.endDate).toBe(createData.endDate);
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in season name', async () => {
      const createData = {
        name: 'Safra 2024/25 - Primeiro Semestre (Janeiro-Junho)',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-06-30T23:59:59.999Z',
        active: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      expect(createResponse.body.name).toBe(createData.name);
    });

    it('should handle leap year dates', async () => {
      const createData = {
        name: 'Safra Ano Bissexto',
        year: 2024,
        startDate: '2024-02-29T00:00:00.000Z',
        endDate: '2024-03-01T00:00:00.000Z',
        active: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      expect(createResponse.body.startDate).toBe(createData.startDate);
    });

    it('should handle future years', async () => {
      const createData = {
        name: 'Safra Futura',
        year: 2030,
        startDate: '2030-01-01T00:00:00.000Z',
        endDate: '2030-12-31T23:59:59.999Z',
        active: false,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/seasons')
        .send(createData)
        .expect(201);

      expect(createResponse.body.year).toBe(2030);
      expect(createResponse.body.active).toBe(false);
    });
  });
});
