import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('FindAllProducersController (e2e)', () => {
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

  describe('GET /producers', () => {
    it('should return list of all producers', async () => {
      await prismaService.producer.createMany({
        data: [
          {
            name: 'Produtor 1',
            cpfCnpj: '28668441060',
          },
          {
            name: 'Produtor 2',
            cpfCnpj: '50767294050',
          },
          {
            name: 'Produtor 3',
            cpfCnpj: '84737830003',
          },
        ],
      });

      const response = await request(app.getHttpServer()).get('/producers/all');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);

      response.body.forEach((producer: any) => {
        expect(producer).toHaveProperty('id');
        expect(producer).toHaveProperty('name');
        expect(producer).toHaveProperty('cpfCnpj');
        expect(producer).toHaveProperty('createdAt');
        expect(producer).toHaveProperty('updatedAt');
      });
    });

    it('should return empty array when there are no producers', async () => {
      const response = await request(app.getHttpServer()).get('/producers/all');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });
});
