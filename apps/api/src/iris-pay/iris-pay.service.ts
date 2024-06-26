import { Injectable } from '@nestjs/common'
import { IrisPayCreateWebhooKDto } from './dto/create-iris-pay.dto'

import {
  CreateCustomerReq,
  CreateIrisCustomerResponse,
  RegisterWebhookReq,
} from './entities/iris-pay.types'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { IrisCreateCustomerDto } from './dto/create-iris-customer'

@Injectable()
export class IrisPayService {
  agentHash: string
  irisEndpoint: string
  constructor(private config: ConfigService, private httpService: HttpService) {
    this.agentHash = this.config.get<string>('IRIS_AGENT_HASH', '')
    this.irisEndpoint = this.config.get<string>('IRIS_API_URL', '')
  }

  async createWebhook(irisRegisterWebhookDto?: IrisPayCreateWebhooKDto) {
    const APP_URL = this.config.get<string>('APP_URL')
    const data: RegisterWebhookReq = {
      url: `${APP_URL}/iris-pay/webhook`,
      agentHash: this.agentHash,
      successUrl: irisRegisterWebhookDto?.successUrl,
      errorUrl: irisRegisterWebhookDto?.errorUrl,
    }
    const webhookUrl = `${this.irisEndpoint}/createhook`
    return (await this.httpService.axiosRef.post<string>(webhookUrl, data)).data
  }

  async createCustomer(irisCreateCustomerDto: IrisCreateCustomerDto) {
    const data: CreateCustomerReq = {
      agentHash: this.agentHash,
      ...irisCreateCustomerDto,
    }

    const createCustomerUrl = `${this.irisEndpoint}/signup`
    return (
      await this.httpService.axiosRef.post<CreateIrisCustomerResponse>(createCustomerUrl, data)
    ).data
  }

  remove(id: number) {
    return `This action removes a #${id} irisPay`
  }
}
