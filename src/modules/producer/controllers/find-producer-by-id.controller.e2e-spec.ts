import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('FindProducerByIdController (e2e)', () => {
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

  describe('GET /producers/:id', () => {
    let existingProducer: any;

    beforeEach(async () => {
      existingProducer = await prismaService.producer.create({
        data: {
          name: 'Produtor Teste',
          cpfCnpj: '12345678901',
        },
      });
    });

    it('should return producer when valid id is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`/producers/${existingProducer.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', existingProducer.id);
      expect(response.body).toHaveProperty('name', existingProducer.name);
      expect(response.body).toHaveProperty('cpfCnpj', existingProducer.cpfCnpj);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 error when producer does not exist', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app.getHttpServer())
        .get(`/producers/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty(
        'message',
        'Produtor não encontrado',
      );
    });

    it('should return 400 error when id format is invalid', async () => {
      const invalidId = 'id-invalido';

      await request(app.getHttpServer())
        .get(`/producers/${invalidId}`)
        .expect(400);
    });

    it('should return 400 error when id is empty', async () => {
      await request(app.getHttpServer()).get('/producers/').expect(404);
    });
  });
});
