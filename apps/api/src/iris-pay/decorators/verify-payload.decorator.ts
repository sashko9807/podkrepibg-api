import { applyDecorators, UseGuards } from '@nestjs/common'
import { VerifyPayloadGuard } from '../guards/verify-payload.guard'

/**
 * Decorator that applies the VerifyPayloadGuard to protect iris-pay endpoints.
 * This guard validates that the x-pbg-signature header contains a valid HMAC-SHA256
 * signature of the request body using the configured PG_PAYLOAD_SECRET as the secret.
 *
 * Usage:
 * @VerifyPayload()
 * @Post('create-payment-session')
 * async createPaymentSession() { ... }
 */
export function VerifyPayload() {
  return applyDecorators(UseGuards(VerifyPayloadGuard))
}
