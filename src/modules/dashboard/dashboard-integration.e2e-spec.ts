import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('Dashboard Module Integration (e2e)', () => {
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

  describe('Dashboard endpoint', () => {
    it('should return dashboard with empty data when no farms exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .expect(200);

      expect(response.body).toEqual({
        totalFarms: 0,
        totalHectares: 0,
        farmsByState: [],
        farmsByCrop: [],
        landUsage: {
          arableAreaHectares: 0,
          vegetationAreaHectares: 0,
        },
      });
    });

    it('should return correct dashboard data with farms and crops', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'Produtor Teste Dashboard',
          cpfCnpj: '98173104000',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: '2024/2025',
          year: 2024,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-08-31'),
        },
      });

      const sojaCrop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const milhoCrop = await prismaService.crop.create({
        data: {
          name: 'Milho',
        },
      });

      const farm1 = await prismaService.farm.create({
        data: {
          name: 'Fazenda SP 1',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000.0,
          arableAreaHectares: 600.0,
          vegetationAreaHectares: 400.0,
          producerId: producer.id,
        },
      });

      const farm2 = await prismaService.farm.create({
        data: {
          name: 'Fazenda SP 2',
          city: 'Campinas',
          state: 'SP',
          totalAreaHectares: 1500.5,
          arableAreaHectares: 900.25,
          vegetationAreaHectares: 600.25,
          producerId: producer.id,
        },
      });

      const farm3 = await prismaService.farm.create({
        data: {
          name: 'Fazenda MG 1',
          city: 'Belo Horizonte',
          state: 'MG',
          totalAreaHectares: 800.75,
          arableAreaHectares: 500.5,
          vegetationAreaHectares: 300.25,
          producerId: producer.id,
        },
      });

      await prismaService.planting.create({
        data: {
          farmId: farm1.id,
          cropId: sojaCrop.id,
          seasonId: season.id,
          plantedAreaHectares: 400.0,
        },
      });

      await prismaService.planting.create({
        data: {
          farmId: farm2.id,
          cropId: sojaCrop.id,
          seasonId: season.id,
          plantedAreaHectares: 500.0,
        },
      });

      await prismaService.planting.create({
        data: {
          farmId: farm2.id,
          cropId: milhoCrop.id,
          seasonId: season.id,
          plantedAreaHectares: 400.25,
        },
      });

      await prismaService.planting.create({
        data: {
          farmId: farm3.id,
          cropId: milhoCrop.id,
          seasonId: season.id,
          plantedAreaHectares: 300.0,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .expect(200);

      expect(response.body.totalFarms).toBe(3);
      expect(response.body.totalHectares).toBe(3301.25); // 1000 + 1500.5 + 800.75

      expect(response.body.farmsByState).toEqual(
        expect.arrayContaining([
          { state: 'SP', count: 2 },
          { state: 'MG', count: 1 },
        ]),
      );

      expect(response.body.farmsByCrop).toEqual(
        expect.arrayContaining([
          { cropName: 'Soja', count: 2 },
          { cropName: 'Milho', count: 2 },
        ]),
      );

      expect(response.body.landUsage.arableAreaHectares).toBe(2000.75); // 600 + 900.25 + 500.5
      expect(response.body.landUsage.vegetationAreaHectares).toBe(1300.5); // 400 + 600.25 + 300.25
    });

    it('should return correct data when farm has multiple crops', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'Produtor Multi Culturas',
          cpfCnpj: '55906093052',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: '2024/2025',
          year: 2024,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-08-31'),
        },
      });

      const crops = await Promise.all([
        prismaService.crop.create({ data: { name: 'Soja' } }),
        prismaService.crop.create({ data: { name: 'Milho' } }),
        prismaService.crop.create({ data: { name: 'Algodão' } }),
      ]);

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Multi Culturas',
          city: 'Ribeirão Preto',
          state: 'SP',
          totalAreaHectares: 2000.0,
          arableAreaHectares: 1200.0,
          vegetationAreaHectares: 800.0,
          producerId: producer.id,
        },
      });

      for (const crop of crops) {
        await prismaService.planting.create({
          data: {
            farmId: farm.id,
            cropId: crop.id,
            seasonId: season.id,
            plantedAreaHectares: 400.0,
          },
        });
      }

      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .expect(200);

      expect(response.body.totalFarms).toBe(1);
      expect(response.body.totalHectares).toBe(2000.0);
      expect(response.body.farmsByState).toEqual([{ state: 'SP', count: 1 }]);

      expect(response.body.farmsByCrop).toEqual(
        expect.arrayContaining([
          { cropName: 'Soja', count: 1 },
          { cropName: 'Milho', count: 1 },
          { cropName: 'Algodão', count: 1 },
        ]),
      );
    });

    it('should handle farms without plantings correctly', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'Produtor Sem Plantios',
          cpfCnpj: '31702742016',
        },
      });

      await prismaService.farm.create({
        data: {
          name: 'Fazenda Sem Plantios',
          city: 'Santos',
          state: 'SP',
          totalAreaHectares: 500.0,
          arableAreaHectares: 300.0,
          vegetationAreaHectares: 200.0,
          producerId: producer.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .expect(200);

      expect(response.body.totalFarms).toBe(1);
      expect(response.body.totalHectares).toBe(500.0);
      expect(response.body.farmsByState).toEqual([{ state: 'SP', count: 1 }]);
      expect(response.body.farmsByCrop).toEqual([]);
      expect(response.body.landUsage.arableAreaHectares).toBe(300.0);
      expect(response.body.landUsage.vegetationAreaHectares).toBe(200.0);
    });
  });

  describe('Dashboard performance with large dataset', () => {
    it('should handle multiple farms efficiently', async () => {
      const producers = await Promise.all([
        prismaService.producer.create({
          data: { name: 'Produtor 1', cpfCnpj: '11111111111' },
        }),
        prismaService.producer.create({
          data: { name: 'Produtor 2', cpfCnpj: '22222222222' },
        }),
        prismaService.producer.create({
          data: { name: 'Produtor 3', cpfCnpj: '33333333333' },
        }),
      ]);

      const season = await prismaService.season.create({
        data: {
          name: '2024/2025',
          year: 2024,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-08-31'),
        },
      });

      const crop = await prismaService.crop.create({
        data: { name: 'Soja' },
      });

      const states = ['SP', 'MG', 'GO', 'MT', 'PR'];
      const farms: any[] = [];

      for (let i = 0; i < 15; i++) {
        const farm = await prismaService.farm.create({
          data: {
            name: `Fazenda ${i + 1}`,
            city: `Cidade ${i + 1}`,
            state: states[i % states.length],
            totalAreaHectares: (i + 1) * 100.5,
            arableAreaHectares: (i + 1) * 60.0,
            vegetationAreaHectares: (i + 1) * 40.5,
            producerId: producers[i % producers.length].id,
          },
        });
        farms.push(farm);

        await prismaService.planting.create({
          data: {
            farmId: farm.id,
            cropId: crop.id,
            seasonId: season.id,
            plantedAreaHectares: (i + 1) * 50.0,
          },
        });
      }

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);

      expect(response.body.totalFarms).toBe(15);
      expect(response.body.farmsByState).toHaveLength(5);
      expect(response.body.farmsByCrop).toEqual([
        { cropName: 'Soja', count: 15 },
      ]);

      const expectedTotalHectares = farms.reduce(
        (sum: number, _: any, index: number) => sum + (index + 1) * 100.5,
        0,
      );
      expect(response.body.totalHectares).toBe(expectedTotalHectares);
    });
  });
});
