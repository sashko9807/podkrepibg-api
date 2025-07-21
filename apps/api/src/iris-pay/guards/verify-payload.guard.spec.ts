import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { VerifyPayloadGuard } from './verify-payload.guard'
import * as crypto from 'crypto'

describe('VerifyPayloadGuard', () => {
  let guard: VerifyPayloadGuard
  let configService: ConfigService

  const mockConfigService = {
    get: jest.fn(),
  }

  const testSecret = 'test-secret-key'
  const testPayload = JSON.stringify({ campaignId: '123', email: 'test@example.com' })

  const createSignature = (payload: string, secret: string): string => {
    return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
  }

  const createMockExecutionContext = (
    headers: Record<string, string> = {},
    body: any = null,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          url: '/iris-pay/create-payment-session',
          body,
        }),
      }),
    } as ExecutionContext
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyPayloadGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    guard = module.get<VerifyPayloadGuard>(VerifyPayloadGuard)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  it('should allow access with valid signature', () => {
    mockConfigService.get.mockReturnValue(testSecret)
    const validSignature = createSignature(testPayload, testSecret)

    const context = createMockExecutionContext(
      {
        'x-pbg-signature': validSignature,
      },
      JSON.parse(testPayload),
    )

    expect(guard.canActivate(context)).toBe(true)
    expect(configService.get).toHaveBeenCalledWith('PG_PAYLOAD_SECRET')
  })

  it('should allow access with valid signature prefixed with sha256=', () => {
    mockConfigService.get.mockReturnValue(testSecret)
    const validSignature = 'sha256=' + createSignature(testPayload, testSecret)

    const context = createMockExecutionContext(
      {
        'x-pbg-signature': validSignature,
      },
      JSON.parse(testPayload),
    )

    expect(guard.canActivate(context)).toBe(true)
  })

  it('should throw UnauthorizedException when x-pbg-signature header is missing', () => {
    mockConfigService.get.mockReturnValue(testSecret)

    const context = createMockExecutionContext({}, JSON.parse(testPayload))

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(context)).toThrow('Missing x-pbg-signature header')
  })

  it('should throw UnauthorizedException when PG_PAYLOAD_SECRET is not configured', () => {
    mockConfigService.get.mockReturnValue(undefined)
    const signature = createSignature(testPayload, 'any-secret')

    const context = createMockExecutionContext(
      {
        'x-pbg-signature': signature,
      },
      JSON.parse(testPayload),
    )

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(context)).toThrow('Signature validation not configured')
  })

  it('should throw UnauthorizedException when signature is invalid', () => {
    mockConfigService.get.mockReturnValue(testSecret)
    const invalidSignature = createSignature(testPayload, 'wrong-secret')

    const context = createMockExecutionContext(
      {
        'x-pbg-signature': invalidSignature,
      },
      JSON.parse(testPayload),
    )

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(context)).toThrow('Invalid signature')
  })

  it('should throw UnauthorizedException when request body is missing', () => {
    mockConfigService.get.mockReturnValue(testSecret)
    const signature = createSignature(testPayload, testSecret)

    const context = createMockExecutionContext(
      {
        'x-pbg-signature': signature,
      },
      null,
    )

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(context)).toThrow(
      'Invalid request body for signature verification',
    )
  })
})
