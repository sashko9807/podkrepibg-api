import { Test, TestingModule } from '@nestjs/testing'
import { IrisPayController } from './iris-pay.controller'
import { IrisPayService } from './iris-pay.service'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

describe('IrisPayController', () => {
  let controller: IrisPayController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule],
      controllers: [IrisPayController],
      providers: [IrisPayService],
    }).compile()

    controller = module.get<IrisPayController>(IrisPayController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
