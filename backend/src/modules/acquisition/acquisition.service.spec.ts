import { Test, TestingModule } from '@nestjs/testing';
import { AcquisitionService } from './acquisition.service';

describe('AcquisitionService', () => {
  let service: AcquisitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcquisitionService],
    }).compile();

    service = module.get<AcquisitionService>(AcquisitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
