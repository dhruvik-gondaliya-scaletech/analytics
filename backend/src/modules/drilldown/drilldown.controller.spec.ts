import { Test, TestingModule } from '@nestjs/testing';
import { DrilldownController } from './drilldown.controller';

describe('DrilldownController', () => {
  let controller: DrilldownController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrilldownController],
    }).compile();

    controller = module.get<DrilldownController>(DrilldownController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
