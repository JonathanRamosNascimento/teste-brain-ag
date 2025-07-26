import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('DashboardController (e2e)', () => {
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
    await prismaService.planting.deleteMany({});
    await prismaService.farm.deleteMany({});
    await prismaService.producer.deleteMany({});
    await prismaService.crop.deleteMany({});
    await prismaService.season.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.planting.deleteMany({});
    await prismaService.farm.deleteMany({});
    await prismaService.producer.deleteMany({});
    await prismaService.crop.deleteMany({});
    await prismaService.season.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('GET /dashboard', () => {
    it('should return dashboard data with empty arrays when no data exists', async () => {
      const response = await request(app.getHttpServer()).get('/dashboard');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalFarms');
      expect(response.body).toHaveProperty('totalHectares');
      expect(response.body).toHaveProperty('farmsByState');
      expect(response.body).toHaveProperty('farmsByCrop');
      expect(response.body).toHaveProperty('landUsage');

      expect(response.body.totalFarms).toBe(0);
      expect(response.body.totalHectares).toBe(0);
      expect(Array.isArray(response.body.farmsByState)).toBe(true);
      expect(Array.isArray(response.body.farmsByCrop)).toBe(true);
    });

    it('should return dashboard data with populated arrays when data exists', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'Produtor Teste',
          cpfCnpj: '12345678901',
        },
      });

      const crop1 = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const crop2 = await prismaService.crop.create({
        data: {
          name: 'Milho',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: '2023/2024',
          year: 2023,
          startDate: new Date('2023-09-01'),
          endDate: new Date('2024-08-31'),
        },
      });

      const farm1 = await prismaService.farm.create({
        data: {
          name: 'Fazenda 1',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000.5,
          arableAreaHectares: 800.0,
          vegetationAreaHectares: 200.5,
          producerId: producer.id,
        },
      });

      const farm2 = await prismaService.farm.create({
        data: {
          name: 'Fazenda 2',
          city: 'Belo Horizonte',
          state: 'MG',
          totalAreaHectares: 500.0,
          arableAreaHectares: 400.0,
          vegetationAreaHectares: 100.0,
          producerId: producer.id,
        },
      });

      await prismaService.planting.create({
        data: {
          farmId: farm1.id,
          cropId: crop1.id,
          seasonId: season.id,
          plantedAreaHectares: 300.0,
        },
      });

      await prismaService.planting.create({
        data: {
          farmId: farm2.id,
          cropId: crop2.id,
          seasonId: season.id,
          plantedAreaHectares: 250.0,
        },
      });

      const response = await request(app.getHttpServer()).get('/dashboard');

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty('totalFarms');
      expect(response.body).toHaveProperty('totalHectares');
      expect(response.body).toHaveProperty('farmsByState');
      expect(response.body).toHaveProperty('farmsByCrop');
      expect(response.body).toHaveProperty('landUsage');

      expect(response.body.totalFarms).toBe(2);
      expect(response.body.totalHectares).toBe(1500.5);

      expect(Array.isArray(response.body.farmsByState)).toBe(true);
      expect(response.body.farmsByState.length).toBeGreaterThan(0);
      response.body.farmsByState.forEach((farmByState: any) => {
        expect(farmByState).toHaveProperty('state');
        expect(farmByState).toHaveProperty('count');
        expect(typeof farmByState.state).toBe('string');
        expect(typeof farmByState.count).toBe('number');
      });

      expect(Array.isArray(response.body.farmsByCrop)).toBe(true);
      expect(response.body.farmsByCrop.length).toBeGreaterThan(0);
      response.body.farmsByCrop.forEach((farmByCrop: any) => {
        expect(farmByCrop).toHaveProperty('cropName');
        expect(farmByCrop).toHaveProperty('count');
        expect(typeof farmByCrop.cropName).toBe('string');
        expect(typeof farmByCrop.count).toBe('number');
      });

      expect(response.body.landUsage).toHaveProperty('arableAreaHectares');
      expect(response.body.landUsage).toHaveProperty('vegetationAreaHectares');
      expect(typeof response.body.landUsage.arableAreaHectares).toBe('number');
      expect(typeof response.body.landUsage.vegetationAreaHectares).toBe(
        'number',
      );
    });
  });
});
