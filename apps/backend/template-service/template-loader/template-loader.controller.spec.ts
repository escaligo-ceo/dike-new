import { Test, TestingModule } from '@nestjs/testing';
import { TemplateLoaderController } from './template-loader.controller';

describe('TemplateLoaderController', () => {
  let controller: TemplateLoaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateLoaderController],
    }).compile();

    controller = module.get<TemplateLoaderController>(TemplateLoaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
