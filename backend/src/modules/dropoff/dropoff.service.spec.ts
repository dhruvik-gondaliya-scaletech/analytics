import { Test, TestingModule } from '@nestjs/testing';
import { DropoffService } from './dropoff.service';

describe('DropoffService', () => {
  let service: DropoffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DropoffService],
    }).compile();

    service = module.get<DropoffService>(DropoffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
