import { Test, TestingModule } from '@nestjs/testing';
import { PrefController } from './pref.controller';

describe('PrefController', () => {
  let controller: PrefController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrefController],
    }).compile();

    controller = module.get<PrefController>(PrefController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
