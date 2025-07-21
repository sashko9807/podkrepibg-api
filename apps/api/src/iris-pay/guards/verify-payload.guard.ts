import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import * as crypto from 'crypto'

@Injectable()
export class VerifyPayloadGuard implements CanActivate {
  private readonly logger = new Logger(VerifyPayloadGuard.name)

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const signature = request.headers['x-pbg-signature'] as string
    const secret = this.configService.get<string>('PG_PAYLOAD_SECRET')

    this.logger.debug(`Verifying payload signature for iris-pay endpoint: ${request.url}`)

    if (!signature) {
      this.logger.warn('Missing x-pbg-signature header in iris-pay request')
      throw new UnauthorizedException('Missing x-pbg-signature header')
    }

    if (!secret) {
      this.logger.error('PG_PAYLOAD_SECRET not configured')
      throw new UnauthorizedException('Signature validation not configured')
    }

    // Get the raw body for signature verification
    const rawBody = this.getRawBody(request)
    if (!rawBody) {
      this.logger.warn('Unable to get raw body for signature verification')
      throw new UnauthorizedException('Invalid request body for signature verification')
    }

    // Verify the signature
    if (!this.verifySignature(rawBody, signature, secret)) {
      this.logger.warn('Invalid signature provided for iris-pay endpoint')
      throw new UnauthorizedException('Invalid signature')
    }

    this.logger.debug('Payload signature validation successful for iris-pay endpoint')
    return true
  }

  private getRawBody(request: Request): string | Buffer | null {
    if (request.body && typeof request.body === 'string') {
      return request.body
    }

    if (request.body && Buffer.isBuffer(request.body)) {
      return request.body
    }

    if (request.body && typeof request.body === 'object') {
      return JSON.stringify(request.body)
    }

    if ((request as any).rawBody) {
      return (request as any).rawBody
    }

    return null
  }

  private verifySignature(payload: string | Buffer, signature: string, secret: string): boolean {
    try {
      const payloadString = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload

      // Create HMAC signature using SHA256
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex')

      // Compare signatures (handle both with and without 'sha256=' prefix)
      const receivedSignature = signature.startsWith('sha256=') ? signature.slice(7) : signature

      // Use crypto.timingSafeEqual for secure comparison
      const expectedBuffer = Buffer.from(expectedSignature, 'hex')
      const receivedBuffer = Buffer.from(receivedSignature, 'hex')

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false
      }

      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    } catch (error) {
      this.logger.error('Error verifying signature:', error)
      return false
    }
  }
}
