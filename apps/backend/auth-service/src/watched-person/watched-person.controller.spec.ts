import { Test, TestingModule } from '@nestjs/testing';
import { WatchedPersonController } from './watched-person.controller';

describe('WatchedPersonController', () => {
  let controller: WatchedPersonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchedPersonController],
    }).compile();

    controller = module.get<WatchedPersonController>(WatchedPersonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
