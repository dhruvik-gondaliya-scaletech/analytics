import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsconfigController } from './analyticsconfig.controller';

describe('AnalyticsconfigController', () => {
  let controller: AnalyticsconfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsconfigController],
    }).compile();

    controller = module.get<AnalyticsconfigController>(AnalyticsconfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
