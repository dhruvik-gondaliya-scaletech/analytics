import { Test, TestingModule } from '@nestjs/testing';
import { RedpandaService } from './redpanda.service';

describe('RedpandaService', () => {
  let service: RedpandaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedpandaService],
    }).compile();

    service = module.get<RedpandaService>(RedpandaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
