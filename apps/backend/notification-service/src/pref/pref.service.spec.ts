import { Test, TestingModule } from '@nestjs/testing';
import { PrefService } from './pref.service';

describe('PrefService', () => {
  let service: PrefService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrefService],
    }).compile();

    service = module.get<PrefService>(PrefService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
