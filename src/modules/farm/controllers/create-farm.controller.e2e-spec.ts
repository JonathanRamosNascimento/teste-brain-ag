import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('CreateFarmController (e2e)', () => {
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
    await prismaService.farm.deleteMany({});
    await prismaService.producer.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.farm.deleteMany({});
    await prismaService.producer.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('POST /farms', () => {
    it('should create a new farm with valid data', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      const response = await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createFarmDto.name);
      expect(response.body.city).toBe(createFarmDto.city);
      expect(response.body.state).toBe(createFarmDto.state);
      expect(response.body.totalAreaHectares).toBe(
        createFarmDto.totalAreaHectares,
      );
      expect(response.body.arableAreaHectares).toBe(
        createFarmDto.arableAreaHectares,
      );
      expect(response.body.vegetationAreaHectares).toBe(
        createFarmDto.vegetationAreaHectares,
      );
      expect(response.body.producerId).toBe(createFarmDto.producerId);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 error when producer does not exist', async () => {
      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(404);
    });

    it('should return 409 error when farm areas are invalid (sum exceeds total)', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 700,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(409);
    });

    it('should return 400 error when name is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when city is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when state is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when totalAreaHectares is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when arableAreaHectares is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when vegetationAreaHectares is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when producerId is not provided', async () => {
      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when state length is invalid', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SAO',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when name is too short', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'A',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when producerId is not a valid UUID', async () => {
      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000,
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: 'invalid-uuid',
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });

    it('should return 400 error when numeric fields are not numbers', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const createFarmDto = {
        name: 'Fazenda Santa Maria',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 'not-a-number',
        arableAreaHectares: 600,
        vegetationAreaHectares: 400,
        producerId: producer.id,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createFarmDto)
        .expect(400);
    });
  });
});
