import { Controller, Get, Post, Body, Req, RawBodyRequest, Query } from '@nestjs/common'
import { IrisPayService } from './iris-pay.service'
import { IRISCreateCheckoutSessionDto } from './dto/create-iris-pay.dto'
import { Public } from 'nest-keycloak-connect'

import { ApiTags } from '@nestjs/swagger'

@Controller('iris-pay')
@ApiTags()
export class IrisPayController {
  constructor(private readonly irisPayService: IrisPayService) {}

  @Post('create-checkout-session')
  @Public()
  async createIRISCheckoutSession(
    @Body() irisCreateCustomerDto: IRISCreateCheckoutSessionDto,
  ): Promise<{ hookHash: string; userHash: string }> {
    return await this.irisPayService.createCheckout(irisCreateCustomerDto)
  }

  @Get('webhook')
  @Public()
  async webhookEndpoint(@Req() req: RawBodyRequest<Request>, @Query('state') state: string) {
    console.log(`Webhook ${state} executed`)
  }
}
