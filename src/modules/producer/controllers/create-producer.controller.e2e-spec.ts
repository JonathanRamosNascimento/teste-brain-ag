import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('CreateProducerController (e2e)', () => {
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
    await prismaService.producer.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.producer.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  describe('POST /producers', () => {
    it('should create a new producer with valid data', async () => {
      const createProducerDto = {
        name: 'João Silva',
        cpfCnpj: '47382441083',
      };

      const response = await request(app.getHttpServer())
        .post('/producers')
        .send(createProducerDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createProducerDto.name);
      expect(response.body.cpfCnpj).toBe(createProducerDto.cpfCnpj);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 error when name is not provided', async () => {
      const createProducerDto = {
        cpfCnpj: '47382441083',
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createProducerDto)
        .expect(400);
    });

    it('should return 400 error when cpfCnpj is not provided', async () => {
      const createProducerDto = {
        name: 'João Silva',
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createProducerDto)
        .expect(400);
    });

    it('should return 400 error when name is an empty string', async () => {
      const createProducerDto = {
        name: '',
        cpfCnpj: '47382441083',
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createProducerDto)
        .expect(400);
    });

    it('should return 400 error when cpfCnpj is an empty string', async () => {
      const createProducerDto = {
        name: 'João Silva',
        cpfCnpj: '',
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createProducerDto)
        .expect(400);
    });

    it('should return 400 error when name is not a string', async () => {
      const createProducerDto = {
        name: 123,
        cpfCnpj: '47382441083',
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createProducerDto)
        .expect(400);
    });

    it('should return 400 error when cpfCnpj is not a string', async () => {
      const createProducerDto = {
        name: 'João Silva',
        cpfCnpj: 123,
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createProducerDto)
        .expect(400);
    });
  });
});
