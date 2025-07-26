import 'dotenv/config';

import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import { PrismaClient } from '@prisma/client';
import NodeEnvironment from 'jest-environment-node';
import { exec } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';

function generateDatabaseURL(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.');
  }

  const url = new URL(process.env.DATABASE_URL);

  url.searchParams.set('schema', schema);

  return url.toString();
}

export default class PrismaTestEnvironment extends NodeEnvironment {
  private schema: string;
  private prisma: PrismaClient;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    this.schema = `test_${randomUUID()}`;
    this.prisma = new PrismaClient();
  }

  async setup() {
    await super.setup();

    const execSync = promisify(exec);
    const databaseURL = generateDatabaseURL(this.schema);

    process.env.DATABASE_URL = databaseURL;
    this.global.process.env.DATABASE_URL = databaseURL;

    await execSync('npx prisma migrate deploy');
  }

  async teardown() {
    try {
      await this.prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`,
      );
    } catch (error) {
      console.warn(`Erro ao remover schema ${this.schema}:`, error.message);
    }

    await this.prisma.$disconnect();

    await super.teardown();
  }
}
