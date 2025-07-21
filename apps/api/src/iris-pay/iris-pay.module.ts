import { Module } from '@nestjs/common'
import { IrisPayService } from './iris-pay.service'
import { IrisPayController } from './iris-pay.controller'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { PrismaModule } from '../prisma/prisma.module'
import { CampaignModule } from '../campaign/campaign.module'
import { DonationsModule } from '../donations/donations.module'
import { VerifyPayloadGuard } from './guards/verify-payload.guard'

@Module({
  imports: [ConfigModule, HttpModule, PrismaModule, CampaignModule, DonationsModule],
  controllers: [IrisPayController],
  providers: [IrisPayService, VerifyPayloadGuard],
})
export class IrisPayModule {}
