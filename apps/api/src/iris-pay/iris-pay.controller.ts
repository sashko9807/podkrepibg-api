import { Controller, Get, Post, Body, Req, RawBodyRequest, Query, Param, HttpCode } from '@nestjs/common'
import { IrisPayService } from './iris-pay.service'
import { IRISCreateCheckoutSessionDto } from './dto/create-iris-pay.dto'
import { FinishPaymentDto } from './dto/finish-payment.dto'
import { Public } from 'nest-keycloak-connect'
import { VerifyPayload } from './decorators/verify-payload.decorator'

import { ApiTags } from '@nestjs/swagger'

@Controller('iris-pay')
@ApiTags()
export class IrisPayController {
  constructor(private readonly irisPayService: IrisPayService) {}

  @Post('create-payment-session')
  @Public()
  @VerifyPayload()
  async createIRISCheckoutSession(
    @Body() irisCreateCustomerDto: IRISCreateCheckoutSessionDto,
  ): Promise<{ hookHash: string; userHash: string }> {
    return await this.irisPayService.createCheckout(irisCreateCustomerDto)
  }

  @Post('verify-payment')
  @HttpCode(200)
  @Public()
  @VerifyPayload()
  async verifyWebhook(@Body() body: { hookHash: string }) {
    return await this.irisPayService.verifyPayment(body)
  }

  @Post('finish')
  @Public()
  @VerifyPayload()
  async finishPaymentSession(
    @Body() finishPaymentDto: FinishPaymentDto,
  ): Promise<{ donationId?: string }> {
    const donationId = await this.irisPayService.finishPaymentSession(finishPaymentDto)
    return { donationId }
  }

  @Get('webhook')
  @Public()
  async webhookEndpoint(@Req() req: RawBodyRequest<Request>, @Query('state') state: string) {
    console.log(`Webhook ${state} executed`)
  }
}
