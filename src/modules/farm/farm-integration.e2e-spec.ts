import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('Farm Module Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testProducerId: string;

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

    const testProducer = await prismaService.producer.create({
      data: {
        name: 'Produtor de Teste',
        cpfCnpj: '98173104000',
      },
    });
    testProducerId = testProducer.id;
  });

  afterAll(async () => {
    await prismaService.farm.deleteMany({});
    await prismaService.producer.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Farm creation scenarios', () => {
    it('should create a farm successfully with valid data', async () => {
      const createData = {
        name: 'Fazenda Teste',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000.5,
        arableAreaHectares: 600.25,
        vegetationAreaHectares: 400.25,
        producerId: testProducerId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/farms')
        .send(createData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(createData.name);
      expect(createResponse.body.city).toBe(createData.city);
      expect(createResponse.body.state).toBe(createData.state);
      expect(createResponse.body.totalAreaHectares).toBe(
        createData.totalAreaHectares,
      );
      expect(createResponse.body.arableAreaHectares).toBe(
        createData.arableAreaHectares,
      );
      expect(createResponse.body.vegetationAreaHectares).toBe(
        createData.vegetationAreaHectares,
      );
      expect(createResponse.body.producerId).toBe(testProducerId);
    });

    it('should create multiple farms for the same producer', async () => {
      const farms = [
        {
          name: 'Fazenda A',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 500.0,
          arableAreaHectares: 300.0,
          vegetationAreaHectares: 200.0,
          producerId: testProducerId,
        },
        {
          name: 'Fazenda B',
          city: 'Campinas',
          state: 'SP',
          totalAreaHectares: 750.5,
          arableAreaHectares: 450.25,
          vegetationAreaHectares: 300.25,
          producerId: testProducerId,
        },
        {
          name: 'Fazenda C',
          city: 'Ribeirão Preto',
          state: 'SP',
          totalAreaHectares: 1200.0,
          arableAreaHectares: 800.0,
          vegetationAreaHectares: 400.0,
          producerId: testProducerId,
        },
      ];

      const createdFarms: any[] = [];
      for (const farm of farms) {
        const response = await request(app.getHttpServer())
          .post('/farms')
          .send(farm)
          .expect(201);
        createdFarms.push(response.body);
      }

      expect(createdFarms).toHaveLength(3);

      farms.forEach((originalFarm, index) => {
        expect(createdFarms[index].name).toBe(originalFarm.name);
        expect(createdFarms[index].city).toBe(originalFarm.city);
        expect(createdFarms[index].producerId).toBe(testProducerId);
      });

      const farmsInDb = await prismaService.farm.findMany({
        where: { producerId: testProducerId },
      });
      expect(farmsInDb).toHaveLength(3);
    });

    it('should return 404 when trying to create farm with non-existent producer', async () => {
      const createData = {
        name: 'Fazenda Inválida',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000.0,
        arableAreaHectares: 600.0,
        vegetationAreaHectares: 400.0,
        producerId: '123e4567-e89b-12d3-a456-426614174000', // ID inexistente
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createData)
        .expect(404);
    });

    it('should return 409 when areas are invalid (sum exceeds total)', async () => {
      const createData = {
        name: 'Fazenda Área Inválida',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000.0,
        arableAreaHectares: 700.0,
        vegetationAreaHectares: 400.0,
        producerId: testProducerId,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createData)
        .expect(409);
    });
  });

  describe('Validation scenarios', () => {
    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        city: 'A',
        state: 'SAO',
        totalAreaHectares: 'invalid',
        arableAreaHectares: -100,
        vegetationAreaHectares: 200,
        producerId: 'invalid-uuid',
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Fazenda Incompleta',
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(incompleteData)
        .expect(400);
    });

    it('should return 400 for name too long', async () => {
      const createData = {
        name: 'A'.repeat(256),
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000.0,
        arableAreaHectares: 600.0,
        vegetationAreaHectares: 400.0,
        producerId: testProducerId,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createData)
        .expect(400);
    });

    it('should return 400 for invalid state format', async () => {
      const createData = {
        name: 'Fazenda Estado Inválido',
        city: 'São Paulo',
        state: 'S',
        totalAreaHectares: 1000.0,
        arableAreaHectares: 600.0,
        vegetationAreaHectares: 400.0,
        producerId: testProducerId,
      };

      await request(app.getHttpServer())
        .post('/farms')
        .send(createData)
        .expect(400);
    });
  });
});
