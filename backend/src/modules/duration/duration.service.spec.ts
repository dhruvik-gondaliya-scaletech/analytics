import { Test, TestingModule } from '@nestjs/testing';
import { DurationService } from './duration.service';

describe('DurationService', () => {
  let service: DurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DurationService],
    }).compile();

    service = module.get<DurationService>(DurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
