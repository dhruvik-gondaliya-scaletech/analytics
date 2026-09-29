import { Test, TestingModule } from '@nestjs/testing';
import { DurationController } from './duration.controller';

describe('DurationController', () => {
  let controller: DurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DurationController],
    }).compile();

    controller = module.get<DurationController>(DurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
