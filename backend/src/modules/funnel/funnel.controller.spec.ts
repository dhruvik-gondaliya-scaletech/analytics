import { Test, TestingModule } from '@nestjs/testing';
import { FunnelController } from './funnel.controller';

describe('FunnelController', () => {
  let controller: FunnelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunnelController],
    }).compile();

    controller = module.get<FunnelController>(FunnelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
