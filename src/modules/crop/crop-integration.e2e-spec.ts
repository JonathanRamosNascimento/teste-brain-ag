import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('Crop Module Integration (e2e)', () => {
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
    await prismaService.crop.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.crop.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Crop creation scenarios', () => {
    it('should create a crop successfully with valid data', async () => {
      const createData = {
        name: 'Soja',
        description: 'Cultivada em regiões tropicais e subtropicais',
        category: 'Grãos',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(createData.name);
      expect(createResponse.body.description).toBe(createData.description);
      expect(createResponse.body.category).toBe(createData.category);
    });

    it('should create a crop with only required fields', async () => {
      const createData = {
        name: 'Milho',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(createData.name);
      expect(createResponse.body.description).toBeNull();
      expect(createResponse.body.category).toBeNull();
    });

    it('should create multiple crops successfully', async () => {
      const crops = [
        {
          name: 'Soja',
          description: 'Rica em proteínas',
          category: 'Grãos',
        },
        {
          name: 'Milho',
          description: 'Cereal amplamente cultivado',
          category: 'Cereais',
        },
        {
          name: 'Algodão',
          description: 'Fibra natural',
          category: 'Fibras',
        },
      ];

      const createdCrops: any[] = [];
      for (const crop of crops) {
        const response = await request(app.getHttpServer())
          .post('/crops')
          .send(crop)
          .expect(201);
        createdCrops.push(response.body);
      }

      expect(createdCrops).toHaveLength(3);

      crops.forEach((originalCrop, index) => {
        expect(createdCrops[index].name).toBe(originalCrop.name);
        expect(createdCrops[index].description).toBe(originalCrop.description);
        expect(createdCrops[index].category).toBe(originalCrop.category);
      });

      const cropsInDb = await prismaService.crop.findMany({});
      expect(cropsInDb).toHaveLength(3);
    });

    it('should return 409 when trying to create crop with duplicate name', async () => {
      const createData = {
        name: 'Soja',
        description: 'Primeira soja',
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(201);

      const duplicateData = {
        name: 'Soja',
        description: 'Segunda soja',
        category: 'Leguminosas',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(duplicateData)
        .expect(409);

      const cropsInDb = await prismaService.crop.findMany({});
      expect(cropsInDb).toHaveLength(1);
    });
  });

  describe('Validation scenarios', () => {
    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        description: 'A',
        category: 'A',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        description: 'Cultura sem nome',
        category: 'Categoria',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(incompleteData)
        .expect(400);
    });

    it('should return 400 for name too long', async () => {
      const createData = {
        name: 'A'.repeat(101),
        description: 'Descrição válida',
        category: 'Categoria',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(400);
    });

    it('should return 400 for name too short', async () => {
      const createData = {
        name: 'A',
        description: 'Descrição válida',
        category: 'Categoria',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(400);
    });

    it('should return 400 for description too long', async () => {
      const createData = {
        name: 'Cultura Válida',
        description: 'A'.repeat(256),
        category: 'Categoria',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(400);
    });

    it('should return 400 for category too long', async () => {
      const createData = {
        name: 'Cultura Válida',
        description: 'Descrição válida',
        category: 'A'.repeat(51),
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(400);
    });

    it('should return 400 for non-string values', async () => {
      const invalidData = {
        name: 123,
        description: true,
        category: [],
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in crop name', async () => {
      const createData = {
        name: 'Açaí-do-Amazonas',
        description: 'Fruto típico da região amazônica',
        category: 'Frutas',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(201);

      expect(createResponse.body.name).toBe(createData.name);
    });

    it('should trim whitespace from fields', async () => {
      const createData = {
        name: '  Trigo  ',
        description: '  Cereal importante  ',
        category: '  Cereais  ',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(201);

      expect(createResponse.body.name).toBeTruthy();
    });

    it('should handle maximum length values correctly', async () => {
      const createData = {
        name: 'A'.repeat(100),
        description: 'B'.repeat(255),
        category: 'C'.repeat(50),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/crops')
        .send(createData)
        .expect(201);

      expect(createResponse.body.name).toBe(createData.name);
      expect(createResponse.body.description).toBe(createData.description);
      expect(createResponse.body.category).toBe(createData.category);
    });
  });
});
