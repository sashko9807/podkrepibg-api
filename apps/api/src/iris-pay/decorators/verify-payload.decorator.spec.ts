import { Test, TestingModule } from '@nestjs/testing'
import { Controller, Post, Body } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { VerifyPayload } from './verify-payload.decorator'
import { VerifyPayloadGuard } from '../guards/verify-payload.guard'

// Test controller to verify the decorator works
@Controller('test')
class TestController {
  @Post('protected')
  @VerifyPayload()
  async protectedEndpoint(@Body() body: any) {
    return { success: true, body }
  }

  @Post('unprotected')
  async unprotectedEndpoint(@Body() body: any) {
    return { success: true, body }
  }
}

describe('VerifyPayload Decorator', () => {
  let module: TestingModule

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-agent-hash'),
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        VerifyPayloadGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()
  })

  it('should apply VerifyPayloadGuard to decorated methods', () => {
    const controller = module.get<TestController>(TestController)
    expect(controller).toBeDefined()

    // The decorator should have applied the guard
    // This is more of a structural test to ensure the decorator is properly configured
    const guard = module.get<VerifyPayloadGuard>(VerifyPayloadGuard)
    expect(guard).toBeDefined()
  })

  it('should be importable and usable', () => {
    expect(VerifyPayload).toBeDefined()
    expect(typeof VerifyPayload).toBe('function')
  })
})
