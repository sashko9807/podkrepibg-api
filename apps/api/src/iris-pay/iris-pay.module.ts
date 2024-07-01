import { Module } from '@nestjs/common'
import { IrisPayService } from './iris-pay.service'
import { IrisPayController } from './iris-pay.controller'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { PrismaModule } from '../prisma/prisma.module'
import { CampaignModule } from '../campaign/campaign.module'

@Module({
  imports: [ConfigModule, HttpModule, PrismaModule, CampaignModule],
  controllers: [IrisPayController],
  providers: [IrisPayService],
})
export class IrisPayModule {}
