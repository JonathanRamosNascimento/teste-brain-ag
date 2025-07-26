import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('CreatePlantingController (e2e)', () => {
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

  describe('POST /plantings', () => {
    it('should create a new planting with valid data (all fields)', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
          description: 'Cultivada em regiões tropicais',
          category: 'Grãos',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 150,
        plantingDate: '2024-02-15',
        expectedHarvestDate: '2024-08-15',
        notes: 'Plantio de soja em área irrigada',
        farmId: farm.id,
        seasonId: season.id,
        cropId: crop.id,
      };

      const response = await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.plantedAreaHectares).toBe(
        createPlantingDto.plantedAreaHectares,
      );
      expect(response.body.plantingDate).toBe(
        new Date(createPlantingDto.plantingDate).toISOString(),
      );
      expect(response.body.expectedHarvestDate).toBe(
        new Date(createPlantingDto.expectedHarvestDate).toISOString(),
      );
      expect(response.body.notes).toBe(createPlantingDto.notes);
      expect(response.body.farmId).toBe(createPlantingDto.farmId);
      expect(response.body.seasonId).toBe(createPlantingDto.seasonId);
      expect(response.body.cropId).toBe(createPlantingDto.cropId);
    });

    it('should create a new planting with only required fields', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Milho',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 75,
        farmId: farm.id,
        seasonId: season.id,
        cropId: crop.id,
      };

      const response = await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.plantedAreaHectares).toBe(
        createPlantingDto.plantedAreaHectares,
      );
      expect(response.body.plantingDate).toBeNull();
      expect(response.body.expectedHarvestDate).toBeNull();
      expect(response.body.notes).toBeNull();
      expect(response.body.farmId).toBe(createPlantingDto.farmId);
      expect(response.body.seasonId).toBe(createPlantingDto.seasonId);
      expect(response.body.cropId).toBe(createPlantingDto.cropId);
    });

    it('should return 404 error when farm does not exist', async () => {
      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: '123e4567-e89b-12d3-a456-426614174000',
        seasonId: season.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(404);
    });

    it('should return 404 error when crop does not exist', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: farm.id,
        seasonId: season.id,
        cropId: '123e4567-e89b-12d3-a456-426614174000',
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(404);
    });

    it('should return 404 error when season does not exist', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: farm.id,
        seasonId: '123e4567-e89b-12d3-a456-426614174000',
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(404);
    });

    it('should return 400 error when plantedAreaHectares is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        farmId: farm.id,
        seasonId: season.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when farmId is not provided', async () => {
      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        seasonId: season.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when seasonId is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: farm.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when cropId is not provided', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: farm.id,
        seasonId: season.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when farmId is not a valid UUID', async () => {
      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: 'invalid-uuid',
        seasonId: season.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when seasonId is not a valid UUID', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: farm.id,
        seasonId: 'invalid-uuid',
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when cropId is not a valid UUID', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        farmId: farm.id,
        seasonId: season.id,
        cropId: 'invalid-uuid',
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when plantedAreaHectares is not a number', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 'not-a-number',
        farmId: farm.id,
        seasonId: season.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when plantingDate is invalid', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        plantingDate: 'invalid-date',
        farmId: farm.id,
        seasonId: season.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });

    it('should return 400 error when expectedHarvestDate is invalid', async () => {
      const producer = await prismaService.producer.create({
        data: {
          name: 'João Silva',
          cpfCnpj: '47382441083',
        },
      });

      const farm = await prismaService.farm.create({
        data: {
          name: 'Fazenda Santa Maria',
          city: 'São Paulo',
          state: 'SP',
          totalAreaHectares: 1000,
          arableAreaHectares: 600,
          vegetationAreaHectares: 400,
          producerId: producer.id,
        },
      });

      const crop = await prismaService.crop.create({
        data: {
          name: 'Soja',
        },
      });

      const season = await prismaService.season.create({
        data: {
          name: 'Safra 2024/2025',
          year: 2024,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          active: true,
        },
      });

      const createPlantingDto = {
        plantedAreaHectares: 100,
        expectedHarvestDate: 'invalid-date',
        farmId: farm.id,
        seasonId: season.id,
        cropId: crop.id,
      };

      await request(app.getHttpServer())
        .post('/plantings')
        .send(createPlantingDto)
        .expect(400);
    });
  });
});
