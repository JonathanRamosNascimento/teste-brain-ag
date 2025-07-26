import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('UpdateProducerController (e2e)', () => {
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

  describe('PATCH /producers', () => {
    let existingProducer: any;

    beforeEach(async () => {
      existingProducer = await prismaService.producer.create({
        data: {
          name: 'Produtor Original',
          cpfCnpj: '52891001052',
        },
      });
    });

    it('should update a producer with valid data', async () => {
      const updateProducerDto = {
        id: existingProducer.id,
        name: 'Produtor Atualizado',
        cpfCnpj: '41667969099',
      };

      const response = await request(app.getHttpServer())
        .patch('/producers')
        .send(updateProducerDto);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(existingProducer.id);
      expect(response.body.name).toBe(updateProducerDto.name);
      expect(response.body.cpfCnpj).toBe(updateProducerDto.cpfCnpj);
      expect(response.body.updatedAt).not.toBe(existingProducer.updatedAt);
    });

    it('should update only the producer name', async () => {
      const updateProducerDto = {
        id: existingProducer.id,
        name: 'Novo Nome',
      };

      const response = await request(app.getHttpServer())
        .patch('/producers')
        .send(updateProducerDto);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(existingProducer.id);
      expect(response.body.name).toBe(updateProducerDto.name);
      expect(response.body.cpfCnpj).toBe(existingProducer.cpfCnpj);
    });

    it('should update only the producer cpfCnpj', async () => {
      const updateProducerDto = {
        id: existingProducer.id,
        cpfCnpj: '75156669000',
      };

      const response = await request(app.getHttpServer())
        .patch('/producers')
        .send(updateProducerDto);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(existingProducer.id);
      expect(response.body.name).toBe(existingProducer.name);
      expect(response.body.cpfCnpj).toBe(updateProducerDto.cpfCnpj);
    });

    it('should return 400 error when id is not provided', async () => {
      const updateProducerDto = {
        name: 'Novo Nome',
      };

      await request(app.getHttpServer())
        .patch('/producers')
        .send(updateProducerDto)
        .expect(400);
    });

    it('should return 400 error when id is not a valid UUID', async () => {
      const updateProducerDto = {
        id: 'id-invalido',
        name: 'Novo Nome',
      };

      await request(app.getHttpServer())
        .patch('/producers')
        .send(updateProducerDto)
        .expect(400);
    });

    it('should return 400 error when name is an empty string', async () => {
      const updateProducerDto = {
        id: existingProducer.id,
        name: '',
      };

      await request(app.getHttpServer())
        .patch('/producers')
        .send(updateProducerDto)
        .expect(400);
    });

    it('should return 400 error when cpfCnpj is an empty string', async () => {
      const updateProducerDto = {
        id: existingProducer.id,
        cpfCnpj: '',
      };

      await request(app.getHttpServer())
        .patch('/producers')
        .send(updateProducerDto)
        .expect(400);
    });
  });
});
