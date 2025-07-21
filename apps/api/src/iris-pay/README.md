# Iris Pay Module

This module handles Iris Pay integration for the Podkrepi.bg platform.

## Security

### VerifyPayload Decorator

The `@VerifyPayload()` decorator provides payload signature authentication for sensitive iris-pay endpoints. It validates that the `x-pbg-signature` header contains a valid HMAC-SHA256 signature of the request body using the configured `PG_PAYLOAD_SECRET` as the secret key.

#### Usage

```typescript
import { VerifyPayload } from './decorators/verify-payload.decorator'

@Controller('iris-pay')
export class IrisPayController {
  @Post('create-payment-session')
  @Public()
  @VerifyPayload()
  async createPaymentSession(@Body() dto: CreatePaymentDto) {
    // This endpoint is now protected by API key validation
    return this.service.createPayment(dto)
  }
}
```

#### Configuration

Make sure to set the `PG_PAYLOAD_SECRET` environment variable:

```bash
PG_PAYLOAD_SECRET=your-secret-key-here
```

#### Protected Endpoints

The following endpoints are currently protected by the `@VerifyPayload()` decorator:

- `POST /iris-pay/create-payment-session` - Creates a new payment session
- `POST /iris-pay/verify-hookhash` - Verifies webhook hash
- `POST /iris-pay/finish` - Finishes the payment process and updates donation status

#### Error Responses

The decorator will return HTTP 401 Unauthorized in the following cases:

- Missing `x-pbg-signature` header
- Invalid signature (doesn't match expected HMAC-SHA256 of request body)
- Missing or invalid request body for signature verification
- `PG_PAYLOAD_SECRET` environment variable not configured

#### Testing

To test protected endpoints, you need to generate a valid HMAC-SHA256 signature of the request body:

```bash
# Example payload
PAYLOAD='{"campaignId": "123", "email": "test@example.com"}'
SECRET="your-pg-payload-secret"

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

# Make the request
curl -X POST http://localhost:5010/api/v1/iris-pay/create-payment-session \
  -H "Content-Type: application/json" \
  -H "x-pbg-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

Or with the `sha256=` prefix:

```bash
curl -X POST http://localhost:5010/api/v1/iris-pay/create-payment-session \
  -H "Content-Type: application/json" \
  -H "x-pbg-signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

#### Implementation Details

- The guard validates the `x-pbg-signature` header contains a valid HMAC-SHA256 signature
- Uses the `PG_PAYLOAD_SECRET` environment variable as the secret key for signature verification
- Supports signatures with or without the `sha256=` prefix
- Uses `crypto.timingSafeEqual()` for secure signature comparison to prevent timing attacks
- Handles different request body formats (string, Buffer, parsed JSON)
- Logs security events for monitoring and debugging
- Can be applied to any controller method that needs payload signature verification

## Endpoints

### POST /iris-pay/finish

Finishes the payment process by updating the donation status in the system.

#### Request Body

```typescript
{
  hookHash: string,           // Payment identifier from iris-pay
  status: string,             // Payment status ('CONFIRMED', 'FAILED', 'WAITTING')
  amount: number,             // Payment amount in smallest currency unit
  billingName?: string,       // Optional billing name
  billingEmail?: string,      // Optional billing email
  metadata: {
    campaignId: string,       // ID of the campaign receiving the donation
    personId: string | null,  // ID of the donor (null for anonymous)
    isAnonymous: 'true' | 'false', // Whether the donation is anonymous
    type: string              // Donation type (e.g., 'donation')
  }
}
```

#### Response

```typescript
{
  donationId?: string  // ID of the created/updated donation
}
```

#### Status Mapping

The endpoint maps iris-pay status strings to internal PaymentStatus enum values:

- `'CONFIRMED'` → `PaymentStatus.succeeded` (payment executed)
- `'FAILED'` → `PaymentStatus.declined` (payment rejected)
- `'WAITTING'` → `PaymentStatus.waiting` (waiting to be processed by ASPSP)
- `'WAITING'` → `PaymentStatus.waiting` (also supports correct spelling)
- Any other status → `PaymentStatus.waiting` (with warning log)

#### Example Usage

```bash
curl -X POST http://localhost:5010/api/v1/iris-pay/finish \
  -H "Content-Type: application/json" \
  -H "x-pbg-signature: sha256=your-signature-here" \
  -d '{
    "hookHash": "payment-123",
    "status": "CONFIRMED",
    "amount": 5000,
    "billingName": "John Doe",
    "billingEmail": "john.doe@example.com",
    "metadata": {
      "campaignId": "campaign-456",
      "personId": "person-789",
      "isAnonymous": "false",
      "type": "donation"
    }
  }'
```
