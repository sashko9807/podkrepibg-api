import { Test, TestingModule } from '@nestjs/testing';
import { IrisPayService } from './iris-pay.service';

describe('IrisPayService', () => {
  let service: IrisPayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IrisPayService],
    }).compile();

    service = module.get<IrisPayService>(IrisPayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
