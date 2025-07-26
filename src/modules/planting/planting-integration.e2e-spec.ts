import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('Planting Module Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testProducerId: string;
  let testFarmId: string;
  let testCropId: string;
  let testSeasonId: string;

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
    await prismaService.crop.deleteMany({});
    await prismaService.season.deleteMany({});
    await prismaService.producer.deleteMany({});

    const testProducer = await prismaService.producer.create({
      data: {
        name: 'Produtor de Teste',
        cpfCnpj: '98173104000',
      },
    });
    testProducerId = testProducer.id;

    const testFarm = await prismaService.farm.create({
      data: {
        name: 'Fazenda de Teste',
        city: 'São Paulo',
        state: 'SP',
        totalAreaHectares: 1000.0,
        arableAreaHectares: 600.0,
        vegetationAreaHectares: 400.0,
        producerId: testProducerId,
      },
    });
    testFarmId = testFarm.id;

    const testCrop = await prismaService.crop.create({
      data: {
        name: 'Soja de Teste',
        description: 'Cultura para testes',
        category: 'Grãos',
      },
    });
    testCropId = testCrop.id;

    const testSeason = await prismaService.season.create({
      data: {
        name: 'Safra 2024/2025',
        year: 2024,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
      },
    });
    testSeasonId = testSeason.id;
  });

  afterAll(async () => {
    await prismaService.planting.deleteMany({});
    await prismaService.farm.deleteMany({});
    await prismaService.crop.deleteMany({});
    await prismaService.season.deleteMany({});
    await prismaService.producer.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Planting creation scenarios', () => {
    it('should create a planting successfully with all data', async () => {
      const createData = {
        plantedAreaHectares: 150.5,
        plantingDate: '2024-01-15',
        expectedHarvestDate: '2024-06-15',
        notes: 'Plantio de soja para teste',
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.plantedAreaHectares).toBe(
        createData.plantedAreaHectares,
      );
      expect(createResponse.body.notes).toBe(createData.notes);
      expect(createResponse.body.farmId).toBe(testFarmId);
      expect(createResponse.body.seasonId).toBe(testSeasonId);
      expect(createResponse.body.cropId).toBe(testCropId);
    });

    it('should create a planting with only required fields', async () => {
      const createData = {
        plantedAreaHectares: 200.0,
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.plantedAreaHectares).toBe(
        createData.plantedAreaHectares,
      );
      expect(createResponse.body.plantingDate).toBeNull();
      expect(createResponse.body.expectedHarvestDate).toBeNull();
      expect(createResponse.body.notes).toBeNull();
      expect(createResponse.body.farmId).toBe(testFarmId);
      expect(createResponse.body.seasonId).toBe(testSeasonId);
      expect(createResponse.body.cropId).toBe(testCropId);
    });

    it('should create multiple plantings with different crops', async () => {
      const anotherCrop = await prismaService.crop.create({
        data: {
          name: 'Milho de Teste',
          description: 'Outra cultura para testes',
          category: 'Cereais',
        },
      });

      const plantings = [
        {
          plantedAreaHectares: 100.0,
          farmId: testFarmId,
          seasonId: testSeasonId,
          cropId: testCropId,
          notes: 'Plantio de soja',
        },
        {
          plantedAreaHectares: 150.0,
          farmId: testFarmId,
          seasonId: testSeasonId,
          cropId: anotherCrop.id,
          notes: 'Plantio de milho',
        },
      ];

      const createdPlantings: any[] = [];
      for (const planting of plantings) {
        const response = await request(app.getHttpServer())
          .post('/plantings')
          .send(planting)
          .expect(201);
        createdPlantings.push(response.body);
      }

      expect(createdPlantings).toHaveLength(2);

      plantings.forEach((originalPlanting, index) => {
        expect(createdPlantings[index].plantedAreaHectares).toBe(
          originalPlanting.plantedAreaHectares,
        );
        expect(createdPlantings[index].notes).toBe(originalPlanting.notes);
        expect(createdPlantings[index].farmId).toBe(testFarmId);
      });

      const plantingsInDb = await prismaService.planting.findMany({});
      expect(plantingsInDb).toHaveLength(2);
    });

    it('should return 409 when trying to create duplicate planting (same crop, season, farm)', async () => {
      const createData = {
        plantedAreaHectares: 100.0,
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
        notes: 'Primeiro plantio',
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(201);

      const duplicateData = {
        plantedAreaHectares: 200.0,
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
        notes: 'Segundo plantio (duplicado)',
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(duplicateData)
        .expect(409);

      const plantingsInDb = await prismaService.planting.findMany({});
      expect(plantingsInDb).toHaveLength(1);
    });

    it('should return 404 when trying to create planting with non-existent farm', async () => {
      const createData = {
        plantedAreaHectares: 100.0,
        farmId: '123e4567-e89b-12d3-a456-426614174000',
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(404);
    });

    it('should return 404 when trying to create planting with non-existent crop', async () => {
      const createData = {
        plantedAreaHectares: 100.0,
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: '123e4567-e89b-12d3-a456-426614174000',
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(404);
    });

    it('should return 404 when trying to create planting with non-existent season', async () => {
      const createData = {
        plantedAreaHectares: 100.0,
        farmId: testFarmId,
        seasonId: '123e4567-e89b-12d3-a456-426614174000',
        cropId: testCropId,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(404);
    });
  });

  describe('Validation scenarios', () => {
    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        plantedAreaHectares: 100.0,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(incompleteData)
        .expect(400);
    });

    it('should return 400 for invalid plantedAreaHectares', async () => {
      const invalidData = {
        plantedAreaHectares: 'invalid',
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for negative plantedAreaHectares', async () => {
      const invalidData = {
        plantedAreaHectares: -100.0,
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid UUID format', async () => {
      const invalidData = {
        plantedAreaHectares: 100.0,
        farmId: 'invalid-uuid',
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid date format', async () => {
      const invalidData = {
        plantedAreaHectares: 100.0,
        plantingDate: 'invalid-date',
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large area values', async () => {
      const createData = {
        plantedAreaHectares: 999999.99,
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(201);

      expect(createResponse.body.plantedAreaHectares).toBe(
        createData.plantedAreaHectares,
      );
    });

    it('should handle special characters in notes', async () => {
      const createData = {
        plantedAreaHectares: 100.0,
        notes: 'Plantio com acentuação: ção, ã, é, ü - e símbolos: @#$%',
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(201);

      expect(createResponse.body.notes).toBe(createData.notes);
    });

    it('should handle dates at year boundaries', async () => {
      const createData = {
        plantedAreaHectares: 100.0,
        plantingDate: '2023-12-31',
        expectedHarvestDate: '2024-01-01',
        farmId: testFarmId,
        seasonId: testSeasonId,
        cropId: testCropId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/plantings')
        .send(createData)
        .expect(201);

      expect(createResponse.body.plantingDate).toBeTruthy();
      expect(createResponse.body.expectedHarvestDate).toBeTruthy();
    });
  });

  describe('Complex integration scenarios', () => {
    it('should create plantings for multiple farms with same crop and season', async () => {
      const anotherFarm = await prismaService.farm.create({
        data: {
          name: 'Segunda Fazenda',
          city: 'Campinas',
          state: 'SP',
          totalAreaHectares: 500.0,
          arableAreaHectares: 300.0,
          vegetationAreaHectares: 200.0,
          producerId: testProducerId,
        },
      });

      const plantings = [
        {
          plantedAreaHectares: 100.0,
          farmId: testFarmId,
          seasonId: testSeasonId,
          cropId: testCropId,
          notes: 'Plantio na primeira fazenda',
        },
        {
          plantedAreaHectares: 80.0,
          farmId: anotherFarm.id,
          seasonId: testSeasonId,
          cropId: testCropId,
          notes: 'Plantio na segunda fazenda',
        },
      ];

      for (const planting of plantings) {
        await request(app.getHttpServer())
          .post('/plantings')
          .send(planting)
          .expect(201);
      }

      const plantingsInDb = await prismaService.planting.findMany({});
      expect(plantingsInDb).toHaveLength(2);
    });
  });
});
