import { Test, TestingModule } from '@nestjs/testing';
import { DrilldownService } from './drilldown.service';

describe('DrilldownService', () => {
  let service: DrilldownService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrilldownService],
    }).compile();

    service = module.get<DrilldownService>(DrilldownService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
