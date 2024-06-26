import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
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
  async createWebhook(@Body() irisRegisterWebhookDto: IrisPayCreateWebhooKDto): Promise<string> {
    return await this.irisPayService.createWebhook(irisRegisterWebhookDto)
  }

  @Post('create-customer')
  @Public()
  async createCustomer(
    @Body() irisCreateCustomerDto: IrisCreateCustomerDto,
  ): Promise<CreateIrisCustomerResponse> {
    return await this.irisPayService.createCustomer(irisCreateCustomerDto)
  }
}
