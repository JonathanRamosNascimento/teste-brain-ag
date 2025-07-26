import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '@database/prisma/prisma.service';

describe('DeleteProducerController (e2e)', () => {
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

  describe('DELETE /producers/:id', () => {
    let existingProducer: any;

    beforeEach(async () => {
      existingProducer = await prismaService.producer.create({
        data: {
          name: 'Produtor para Deletar',
          cpfCnpj: '09247643090',
        },
      });
    });

    it('should delete an existing producer', async () => {
      await request(app.getHttpServer())
        .delete(`/producers/${existingProducer.id}`)
        .expect(200);

      const deletedProducer = await prismaService.producer.findUnique({
        where: { id: existingProducer.id },
      });

      expect(deletedProducer).toBeNull();
    });

    it('should return 400 error when id is invalid', async () => {
      await request(app.getHttpServer())
        .delete('/producers/id-invalido')
        .expect(400);
    });

    it('should handle attempt to delete non-existent producer', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer())
        .delete(`/producers/${nonExistentId}`)
        .expect((res) => {
          expect([200, 400, 404]).toContain(res.status);
        });
    });
  });
});
