import { AppLogger } from '@dike/common';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../database/database.module';
import { LogService } from './log.service';
import { entities } from '../database/entites';

describe('AuditService', () => {
  let app: INestApplication,
  service: LogService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        TypeOrmModule.forFeature(entities),
      ],
      providers: [LogService, AppLogger],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    service = app.get<LogService>(LogService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('AuditEventService should be defined', () => {
    expect(service).toBeDefined();
  });
});
