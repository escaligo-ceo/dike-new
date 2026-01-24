import { Test, TestingModule } from '@nestjs/testing';
import { ImportServiceController } from './app.controller';
import { ImportServiceService } from './app.service';

describe('ImportServiceController', () => {
  let importServiceController: ImportServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ImportServiceController],
      providers: [ImportServiceService],
    }).compile();

    importServiceController = app.get<ImportServiceController>(ImportServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(importServiceController.getHello()).toBe('Hello World!');
    });
  });
});
