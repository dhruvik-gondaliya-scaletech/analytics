import { Test, TestingModule } from '@nestjs/testing';
import { DropoffController } from './dropoff.controller';

describe('DropoffController', () => {
  let controller: DropoffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DropoffController],
    }).compile();

    controller = module.get<DropoffController>(DropoffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
