import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsconfigService } from './analyticsconfig.service';

describe('AnalyticsconfigService', () => {
  let service: AnalyticsconfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsconfigService],
    }).compile();

    service = module.get<AnalyticsconfigService>(AnalyticsconfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
