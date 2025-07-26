import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('CreateCropController (e2e)', () => {
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

  describe('POST /crops', () => {
    it('should create a new crop with valid data (all fields)', async () => {
      const createCropDto = {
        name: 'Soja',
        description: 'Cultivada em regiões tropicais',
        category: 'Grãos',
      };

      const response = await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createCropDto.name);
      expect(response.body.description).toBe(createCropDto.description);
      expect(response.body.category).toBe(createCropDto.category);
    });

    it('should create a new crop with only required fields', async () => {
      const createCropDto = {
        name: 'Milho',
      };

      const response = await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createCropDto.name);
      expect(response.body.description).toBeNull();
      expect(response.body.category).toBeNull();
    });

    it('should return 409 error when crop already exists', async () => {
      await prismaService.crop.create({
        data: {
          name: 'Soja',
          description: 'Cultivada em regiões tropicais',
          category: 'Grãos',
        },
      });

      const createCropDto = {
        name: 'Soja',
        description: 'Outra descrição',
        category: 'Outra categoria',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(409);
    });

    it('should return 400 error when name is not provided', async () => {
      const createCropDto = {
        description: 'Cultivada em regiões tropicais',
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when name is an empty string', async () => {
      const createCropDto = {
        name: '',
        description: 'Cultivada em regiões tropicais',
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when name is not a string', async () => {
      const createCropDto = {
        name: 123,
        description: 'Cultivada em regiões tropicais',
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when name is too short', async () => {
      const createCropDto = {
        name: 'A',
        description: 'Cultivada em regiões tropicais',
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when name is too long', async () => {
      const createCropDto = {
        name: 'A'.repeat(101),
        description: 'Cultivada em regiões tropicais',
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when description is not a string', async () => {
      const createCropDto = {
        name: 'Soja',
        description: 123,
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when description is too short', async () => {
      const createCropDto = {
        name: 'Soja',
        description: 'A',
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when description is too long', async () => {
      const createCropDto = {
        name: 'Soja',
        description: 'A'.repeat(256),
        category: 'Grãos',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when category is not a string', async () => {
      const createCropDto = {
        name: 'Soja',
        description: 'Cultivada em regiões tropicais',
        category: 123,
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when category is too short', async () => {
      const createCropDto = {
        name: 'Soja',
        description: 'Cultivada em regiões tropicais',
        category: 'A',
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });

    it('should return 400 error when category is too long', async () => {
      const createCropDto = {
        name: 'Soja',
        description: 'Cultivada em regiões tropicais',
        category: 'A'.repeat(51),
      };

      await request(app.getHttpServer())
        .post('/crops')
        .send(createCropDto)
        .expect(400);
    });
  });
});
