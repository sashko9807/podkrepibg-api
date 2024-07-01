import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { IRISCreateCheckoutSessionDto } from './dto/create-iris-pay.dto'

import {
  CreateCustomerReq,
  CreateIrisCustomerResponse,
  RegisterWebhookReq,
} from './entities/iris-pay.types'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { IrisCreateCustomerDto } from './dto/create-iris-customer'
import { PrismaService } from '../prisma/prisma.service'
import { CampaignService } from '../campaign/campaign.service'

@Injectable()
export class IrisPayService {
  agentHash: string
  irisEndpoint: string
  constructor(
    private config: ConfigService,
    private httpService: HttpService,
    private prismaService: PrismaService,
    private campaignService: CampaignService,
  ) {
    this.agentHash = this.config.get<string>('IRIS_AGENT_HASH', '')
    this.irisEndpoint = this.config.get<string>('IRIS_API_URL', '')
  }

  async createWebhook(irisRegisterWebhookDto?: IRISCreateCheckoutSessionDto) {
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
    const irisCustomer = await this.prismaService.irisCustomer.findFirst({
      where: { email: irisCreateCustomerDto.email },
    })
    if (irisCustomer) {
      Logger.debug('Customer with email found')
      return irisCustomer.userHash
    }
    const data: CreateCustomerReq = {
      agentHash: this.agentHash,
      ...irisCreateCustomerDto,
    }

    Logger.debug('IRIS Customer not found. Creating new one')
    const createCustomerUrl = `${this.irisEndpoint}/signup`
    const irisCreateCustomer = await this.httpService.axiosRef.post<CreateIrisCustomerResponse>(
      createCustomerUrl,
      data,
    )
    await this.prismaService.irisCustomer.create({
      data: { email: irisCreateCustomerDto.email, userHash: irisCreateCustomer.data.userHash },
    })
    return irisCreateCustomer.data.userHash
  }

  async createCheckout(irisCreateCheckoutDto: IRISCreateCheckoutSessionDto) {
    const campaign = await this.campaignService.getCampaignById(irisCreateCheckoutDto.campaignId)
    await this.campaignService.validateCampaign(campaign)
    const userObj: IrisCreateCustomerDto = {
      email: irisCreateCheckoutDto.email,
      name: irisCreateCheckoutDto.name,
      family: irisCreateCheckoutDto.family,
    }
    const userHashRes = this.createCustomer(userObj)
    const webhookRes = this.createWebhook(irisCreateCheckoutDto)
    const [userHash, webhook] = await Promise.allSettled([userHashRes, webhookRes])
    if (userHash.status !== 'fulfilled' || webhook.status !== 'fulfilled') {
      throw new InternalServerErrorException(
        "Couldn't initiate IRIS checkout at this time.\n Please try again later",
      )
    }

    return {
      hookHash: webhook.value,
      userHash: userHash.value,
    }
  }
  remove(id: number) {
    return `This action removes a #${id} irisPay`
  }
}
