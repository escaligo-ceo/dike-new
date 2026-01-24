import { Test, TestingModule } from '@nestjs/testing';
import { WatchedPersonService } from './watched-person.service';

describe('WatchedPersonService', () => {
  let service: WatchedPersonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchedPersonService],
    }).compile();

    service = module.get<WatchedPersonService>(WatchedPersonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
