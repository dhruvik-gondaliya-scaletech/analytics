import { Test, TestingModule } from '@nestjs/testing';
import { AcquisitionController } from './acquisition.controller';

describe('AcquisitionController', () => {
  let controller: AcquisitionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcquisitionController],
    }).compile();

    controller = module.get<AcquisitionController>(AcquisitionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
