import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  RawBodyRequest,
  Query,
} from '@nestjs/common'
import { IrisPayService } from './iris-pay.service'
import { IrisPayCreateWebhooKDto } from './dto/create-iris-pay.dto'
import { Public } from 'nest-keycloak-connect'
import { IrisCreateCustomerDto } from './dto/create-iris-customer'
import { CreateIrisCustomerResponse } from './entities/iris-pay.types'
import { ApiTags } from '@nestjs/swagger'

@Controller('iris-pay')
@ApiTags()
export class IrisPayController {
  constructor(private readonly irisPayService: IrisPayService) {}

  @Post('create-webhook')
  @Public()
  async createWebhook(
    @Body() irisRegisterWebhookDto: IrisPayCreateWebhooKDto,
  ): Promise<{ webhookHash: string }> {
    const webhookHash = await this.irisPayService.createWebhook(irisRegisterWebhookDto)
    console.log(webhookHash)
    return { webhookHash: webhookHash }
  }

  @Post('create-customer')
  @Public()
  async createCustomer(
    @Body() irisCreateCustomerDto: IrisCreateCustomerDto,
  ): Promise<CreateIrisCustomerResponse> {
    return await this.irisPayService.createCustomer(irisCreateCustomerDto)
  }

  @Get('webhook')
  @Public()
  async webhookEndpoint(@Req() req: RawBodyRequest<Request>, @Query('status') status: string) {
    console.log(status)
    console.log(req)
  }
}
// 70c13c8a-ea44-4a90-a996-a498acf2c55a
