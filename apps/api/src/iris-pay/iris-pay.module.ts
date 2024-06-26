import { Module } from '@nestjs/common'
import { IrisPayService } from './iris-pay.service'
import { IrisPayController } from './iris-pay.controller'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [IrisPayController],
  providers: [IrisPayService],
})
export class IrisPayModule {}
