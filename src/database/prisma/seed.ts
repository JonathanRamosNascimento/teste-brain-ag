import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seed = async () => {
  // Create producers
  const producers = await Promise.all([
    prisma.producer.create({
      data: {
        cpfCnpj: '12345678901234',
        name: 'João Silva Ramos',
      },
    }),
    prisma.producer.create({
      data: {
        cpfCnpj: '98765432100',
        name: 'Moises Cunha Santos',
      },
    }),
    prisma.producer.create({
      data: {
        cpfCnpj: '11223344556677',
        name: 'Fazendas Reunidas São Paulo Ltda',
      },
    }),
  ]);

  // Create seasons
  const seasons = await Promise.all([
    prisma.season.create({
      data: {
        name: 'Safra 2024/2025',
        year: 2024,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-08-31'),
        active: true,
      },
    }),
    prisma.season.create({
      data: {
        name: 'Safra 2023/2024',
        year: 2023,
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-08-31'),
        active: false,
      },
    }),
  ]);

  // Create crops
  const crops = await Promise.all([
    prisma.crop.create({
      data: {
        name: 'Soja',
        description: 'Soja para produção de grãos e óleo',
        category: 'Grãos',
      },
    }),
    prisma.crop.create({
      data: {
        name: 'Milho',
        description: 'Milho para produção de ração',
        category: 'Grãos',
      },
    }),
    prisma.crop.create({
      data: {
        name: 'Café',
        description: 'Café arábica',
        category: 'Grãos',
      },
    }),
  ]);

  // Create farms
  const farms = await Promise.all([
    prisma.farm.create({
      data: {
        producerId: producers[0].id,
        name: 'Fazenda Ribeirão',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalAreaHectares: 500.0,
        arableAreaHectares: 350.0,
        vegetationAreaHectares: 150.0,
      },
    }),
    prisma.farm.create({
      data: {
        producerId: producers[1].id,
        name: 'Fazenda Mata dos Crioulos',
        city: 'Ouro Verde de Goiás',
        state: 'GO',
        totalAreaHectares: 800.75,
        arableAreaHectares: 600.0,
        vegetationAreaHectares: 200.75,
      },
    }),
  ]);

  // Create plantings
  await Promise.all([
    prisma.planting.create({
      data: {
        farmId: farms[0].id,
        seasonId: seasons[0].id,
        cropId: crops[0].id, // Soja
        plantedAreaHectares: 200.0,
        plantingDate: new Date('2023-10-15'),
        expectedHarvestDate: new Date('2024-02-15'),
        notes: 'Plantio realizado com sementes de alta produtividade',
      },
    }),
    prisma.planting.create({
      data: {
        farmId: farms[0].id,
        seasonId: seasons[0].id,
        cropId: crops[1].id, // Milho
        plantedAreaHectares: 150.0,
        plantingDate: new Date('2023-11-01'),
        expectedHarvestDate: new Date('2024-03-01'),
        notes: 'Milho safrinha plantado após a soja',
      },
    }),
  ]);
};

const main = async () => {
  await seed();
};

main()
  .then(() => {
    console.log('✅ Database seed successfully performed!');
  })
  .catch((error) => {
    console.error('❌ Seed error: ', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('🔌 Seed disconect! ');
    prisma.$disconnect();
  });
