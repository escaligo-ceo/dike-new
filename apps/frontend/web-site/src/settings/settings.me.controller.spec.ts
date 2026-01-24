import { Test, TestingModule } from '@nestjs/testing';
import { SettingsMeController } from './settings.me.controller';

describe('SettingsMeController', () => {
  let controller: SettingsMeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsMeController],
    }).compile();

    controller = module.get<SettingsMeController>(SettingsMeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
