import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('Producer Module Integration (e2e)', () => {
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

  describe('Complex integration scenarios', () => {
    it('should create, list, update and delete a producer in sequence', async () => {
      const createData = {
        name: 'Produtor Completo',
        cpfCnpj: '98173104000',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/producers')
        .send(createData)
        .expect(201);

      const producerId = createResponse.body.id;

      const listResponse = await request(app.getHttpServer())
        .get('/producers/all')
        .expect(200);

      expect(
        listResponse.body.find((p: any) => p.id === producerId),
      ).toBeDefined();

      const updateData = {
        id: producerId,
        name: 'Produtor Atualizado',
      };

      const updateResponse = await request(app.getHttpServer())
        .patch('/producers')
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.name).toBe('Produtor Atualizado');

      await request(app.getHttpServer())
        .delete(`/producers/${producerId}`)
        .expect(200);

      const finalListResponse = await request(app.getHttpServer())
        .get('/producers/all')
        .expect(200);

      expect(
        finalListResponse.body.find((p: any) => p.id === producerId),
      ).toBeUndefined();
    });

    it('should create multiple producers and verify listing', async () => {
      const producers = [
        { name: 'Produtor A', cpfCnpj: '55906093052' },
        { name: 'Produtor B', cpfCnpj: '31702742016' },
        { name: 'Produtor C', cpfCnpj: '17995451059' },
      ];

      for (const producer of producers) {
        await request(app.getHttpServer())
          .post('/producers')
          .send(producer)
          .expect(201);
      }

      const listResponse = await request(app.getHttpServer())
        .get('/producers/all')
        .expect(200);

      expect(listResponse.body).toHaveLength(3);

      producers.forEach((originalProducer) => {
        const foundProducer = listResponse.body.find(
          (p: any) => p.cpfCnpj === originalProducer.cpfCnpj,
        );
        expect(foundProducer).toBeDefined();
        expect(foundProducer.name).toBe(originalProducer.name);
      });
    });
  });
});
