import { Module } from '@nestjs/common';
import { IrisPayService } from './iris-pay.service';
import { IrisPayController } from './iris-pay.controller';

@Module({
  controllers: [IrisPayController],
  providers: [IrisPayService]
})
export class IrisPayModule {}
