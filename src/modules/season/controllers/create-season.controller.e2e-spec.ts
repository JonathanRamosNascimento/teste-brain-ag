import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('CreateSeasonController (e2e)', () => {
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

  describe('POST /seasons', () => {
    it('should create a new season with valid data (all fields)', async () => {
      const createSeasonDto = {
        name: '2024',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createSeasonDto.name);
      expect(response.body.year).toBe(createSeasonDto.year);
      expect(new Date(response.body.startDate)).toEqual(
        new Date(createSeasonDto.startDate),
      );
      expect(new Date(response.body.endDate)).toEqual(
        new Date(createSeasonDto.endDate),
      );
      expect(response.body.active).toBe(createSeasonDto.active);
    });

    it('should create a new season with only required fields (active defaults to true)', async () => {
      const createSeasonDto = {
        name: '2025',
        year: 2025,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.999Z',
      };

      const response = await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createSeasonDto.name);
      expect(response.body.year).toBe(createSeasonDto.year);
      expect(new Date(response.body.startDate)).toEqual(
        new Date(createSeasonDto.startDate),
      );
      expect(new Date(response.body.endDate)).toEqual(
        new Date(createSeasonDto.endDate),
      );
      expect(response.body.active).toBe(true);
    });

    it('should return 409 error when season already exists', async () => {
      await prismaService.season.create({
        data: {
          name: '2024',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          active: true,
        },
      });

      const createSeasonDto = {
        name: '2024',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(409);
    });

    it('should return 400 error when name is not provided', async () => {
      const createSeasonDto = {
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when year is not provided', async () => {
      const createSeasonDto = {
        name: '2024',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when startDate is not provided', async () => {
      const createSeasonDto = {
        name: '2024',
        year: 2024,
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when endDate is not provided', async () => {
      const createSeasonDto = {
        name: '2024',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when name is an empty string', async () => {
      const createSeasonDto = {
        name: '',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when name is not a string', async () => {
      const createSeasonDto = {
        name: 123,
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when year is not a number', async () => {
      const createSeasonDto = {
        name: '2024',
        year: '2024',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when startDate is not a valid date', async () => {
      const createSeasonDto = {
        name: '2024',
        year: 2024,
        startDate: 'invalid-date',
        endDate: '2024-12-31T23:59:59.999Z',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when endDate is not a valid date', async () => {
      const createSeasonDto = {
        name: '2024',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: 'invalid-date',
        active: true,
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should return 400 error when active is not a boolean', async () => {
      const createSeasonDto = {
        name: '2024',
        year: 2024,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        active: 'not-a-boolean',
      };

      await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto)
        .expect(400);
    });

    it('should create season with active as false', async () => {
      const createSeasonDto = {
        name: '2023',
        year: 2023,
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T23:59:59.999Z',
        active: false,
      };

      const response = await request(app.getHttpServer())
        .post('/seasons')
        .send(createSeasonDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createSeasonDto.name);
      expect(response.body.year).toBe(createSeasonDto.year);
      expect(new Date(response.body.startDate)).toEqual(
        new Date(createSeasonDto.startDate),
      );
      expect(new Date(response.body.endDate)).toEqual(
        new Date(createSeasonDto.endDate),
      );
      expect(response.body.active).toBe(false);
    });
  });
});
