import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { CampaignService } from '../../campaign/campaign.service'
import { PaymentSucceededService } from './payment-intent-succeeded.service'
import { getPaymentData } from '../helpers/payment-intent-helpers'
import Stripe from 'stripe'
import { VaultService } from '../../vault/vault.service'
import { PersonService } from '../../person/person.service'
import { MockPrismaService } from '../../prisma/prisma-client.mock'
import { getCountryRegion } from '../helpers/stripe-fee-calculator'

describe('PaymentService', () => {
  let service: PaymentSucceededService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        PaymentSucceededService,
        CampaignService,
        MockPrismaService,
        VaultService,
        PersonService,
      ],
    }).compile()

    service = module.get<PaymentSucceededService>(PaymentSucceededService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('accept payment-intent.created', async () => {
    const mockPaymentIntentCreated: Stripe.PaymentIntent = {
      id: 'pi_3LNwijKApGjVGa9t1F9QYd5s',
      object: 'payment_intent',
      amount: 1065,
      amount_capturable: 0,
      amount_details: {
        tip: {},
      },
      amount_received: 0,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: 'automatic',
      charges: {
        object: 'list',
        data: [],
        has_more: false,
        url: '/v1/charges?payment_intent=pi_3LNwijKApGjVGa9t1F9QYd5s',
      },
      client_secret: null,
      confirmation_method: 'automatic',
      created: 1658399705,
      currency: 'bgn',
      customer: null,
      description: null,
      invoice: null,
      last_payment_error: null,
      livemode: false,
      metadata: {
        campaignId: '4c1616b0-1284-4b7d-8b89-9098e7ded2c4',
      },
      next_action: null,
      on_behalf_of: null,
      payment_method: null,
      payment_method_options: {
        card: {
          installments: null,
          mandate_options: null,
          network: null,
          request_three_d_secure: 'automatic',
        },
      },
      payment_method_types: ['card'],
      processing: null,
      receipt_email: null,
      review: null,
      setup_future_usage: null,
      shipping: null,
      source: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'requires_payment_method',
      transfer_data: null,
      transfer_group: null,
    }

    const billingDetails = getPaymentData(mockPaymentIntentCreated)
    expect(billingDetails.netAmount).toEqual(0)
    expect(billingDetails.chargedAmount).toEqual(1065)
  })

  it('accept payment-intent.succeeded with BG tax included in charge', async () => {
    const mockPaymentIntentCreated: Stripe.PaymentIntent = {
      id: 'pi_3LNwijKApGjVGa9t1F9QYd5s',
      object: 'payment_intent',
      amount: 1065,
      amount_capturable: 0,
      amount_details: {
        tip: {},
      },
      amount_received: 1065,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: 'automatic',
      charges: {
        object: 'list',
        data: [
          {
            id: 'ch_3LNwijKApGjVGa9t1tuRzvbL',
            object: 'charge',
            amount: 1065,
            amount_captured: 1065,
            amount_refunded: 0,
            application: null,
            application_fee: null,
            application_fee_amount: null,
            balance_transaction: 'txn_3LNwijKApGjVGa9t100xnggj',
            billing_details: {
              address: {
                city: null,
                country: 'BG',
                line1: null,
                line2: null,
                postal_code: null,
                state: null,
              },
              email: 'test@gmail.com',
              name: 'First Last',
              phone: null,
            },
            calculated_statement_descriptor: 'PODKREPI.BG',
            captured: true,
            created: 1658399779,
            currency: 'bgn',
            customer: 'cus_M691kVNYuUp4po',
            description: null,
            destination: null,
            dispute: null,
            disputed: false,
            failure_balance_transaction: null,
            failure_code: null,
            failure_message: null,
            fraud_details: {},
            invoice: null,
            livemode: false,
            metadata: {
              campaignId: '4c1616b0-1284-4b7d-8b89-9098e7ded2c4',
            },
            on_behalf_of: null,
            outcome: {
              network_status: 'approved_by_network',
              reason: null,
              risk_level: 'normal',
              risk_score: 33,
              seller_message: 'Payment complete.',
              type: 'authorized',
            },
            paid: true,
            payment_intent: 'pi_3LNwijKApGjVGa9t1F9QYd5s',
            payment_method: 'pm_1LNwjtKApGjVGa9thtth9iu7',
            payment_method_details: {
              card: {
                brand: 'visa',
                checks: {
                  address_line1_check: null,
                  address_postal_code_check: null,
                  cvc_check: 'pass',
                },
                country: 'BG',
                exp_month: 4,
                exp_year: 2024,
                fingerprint: 'iCySKWAAAZGp2hwr',
                funding: 'credit',
                installments: null,
                last4: '0000',
                mandate: null,
                network: 'visa',
                three_d_secure: null,
                wallet: null,
              },
              type: 'card',
            },
            receipt_email: 'test@gmail.com',
            receipt_number: null,
            receipt_url: 'https://pay.stripe.com/receipts/',
            refunded: false,
            refunds: {
              object: 'list',
              data: [],
              has_more: false,
              url: '/v1/charges/ch_3LNwijKApGjVGa9t1tuRzvbL/refunds',
            },
            review: null,
            shipping: null,
            source: null,
            source_transfer: null,
            statement_descriptor: null,
            statement_descriptor_suffix: null,
            status: 'succeeded',
            transfer_data: null,
            transfer_group: null,
          },
        ],
        has_more: false,
        url: '/v1/charges?payment_intent=pi_3LNwijKApGjVGa9t1F9QYd5s',
      },
      client_secret: 'xxx',
      confirmation_method: 'automatic',
      created: 1658399705,
      currency: 'bgn',
      customer: 'cus_M691kVNYuUp4po',
      description: null,
      invoice: null,
      last_payment_error: null,
      livemode: false,
      metadata: {
        campaignId: '4c1616b0-1284-4b7d-8b89-9098e7ded2c4',
      },
      next_action: null,
      on_behalf_of: null,
      payment_method: 'pm_1LNwjtKApGjVGa9thtth9iu7',
      payment_method_options: {
        card: {
          installments: null,
          mandate_options: null,
          network: null,
          request_three_d_secure: 'automatic',
        },
      },
      payment_method_types: ['card'],
      processing: null,
      receipt_email: 'test@gmail.com',
      review: null,
      setup_future_usage: null,
      shipping: null,
      source: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'succeeded',
      transfer_data: null,
      transfer_group: null,
    }

    const billingDetails = getPaymentData(mockPaymentIntentCreated)
    expect(billingDetails.netAmount).toEqual(1000)
    expect(billingDetails.chargedAmount).toEqual(1065)
  })
})

it('accept payment-intent.succeeded with BG tax not included in charge', async () => {
  const mockPaymentIntentCreated: Stripe.PaymentIntent = {
    id: 'pi_3LNwkHKApGjVGa9t1TLyVofD',
    object: 'payment_intent',
    amount: 1000,
    amount_capturable: 0,
    amount_details: {
      tip: {},
    },
    amount_received: 1000,
    application: null,
    application_fee_amount: null,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: 'automatic',
    charges: {
      object: 'list',
      data: [
        {
          id: 'ch_3LNwkHKApGjVGa9t1bkp20zi',
          object: 'charge',
          amount: 1000,
          amount_captured: 1000,
          amount_refunded: 0,
          application: null,
          application_fee: null,
          application_fee_amount: null,
          balance_transaction: 'txn_3LNwkHKApGjVGa9t1EH1EZxk',
          billing_details: {
            address: {
              city: null,
              country: 'BG',
              line1: null,
              line2: null,
              postal_code: null,
              state: null,
            },
            email: 'test@gmail.com',
            name: 'nepokriti',
            phone: null,
          },
          calculated_statement_descriptor: 'PODKREPI.BG',
          captured: true,
          created: 1658399823,
          currency: 'bgn',
          customer: 'cus_M692d4eal3rlWR',
          description: null,
          destination: null,
          dispute: null,
          disputed: false,
          failure_balance_transaction: null,
          failure_code: null,
          failure_message: null,
          fraud_details: {},
          invoice: null,
          livemode: false,
          metadata: {
            campaignId: '4c1616b0-1284-4b7d-8b89-9098e7ded2c4',
          },
          on_behalf_of: null,
          outcome: {
            network_status: 'approved_by_network',
            reason: null,
            risk_level: 'normal',
            risk_score: 20,
            seller_message: 'Payment complete.',
            type: 'authorized',
          },
          paid: true,
          payment_intent: 'pi_3LNwkHKApGjVGa9t1TLyVofD',
          payment_method: 'pm_1LNwkbKApGjVGa9tmWVdg46e',
          payment_method_details: {
            card: {
              brand: 'visa',
              checks: {
                address_line1_check: null,
                address_postal_code_check: null,
                cvc_check: 'pass',
              },
              country: 'BG',
              exp_month: 4,
              exp_year: 2032,
              fingerprint: 'iCySKWAAAZGp2hwr',
              funding: 'credit',
              installments: null,
              last4: '0000',
              mandate: null,
              network: 'visa',
              three_d_secure: null,
              wallet: null,
            },
            type: 'card',
          },
          receipt_email: 'test@gmail.com',
          receipt_number: null,
          receipt_url: 'https://pay.stripe.com/receipts/',
          refunded: false,
          refunds: {
            object: 'list',
            data: [],
            has_more: false,
            url: '/v1/charges/ch_3LNwkHKApGjVGa9t1bkp20zi/refunds',
          },
          review: null,
          shipping: null,
          source: null,
          source_transfer: null,
          statement_descriptor: null,
          statement_descriptor_suffix: null,
          status: 'succeeded',
          transfer_data: null,
          transfer_group: null,
        },
      ],
      has_more: false,
      url: '/v1/charges?payment_intent=pi_3LNwkHKApGjVGa9t1TLyVofD',
    },
    client_secret: null,
    confirmation_method: 'automatic',
    created: 1658399801,
    currency: 'bgn',
    customer: 'cus_M692d4eal3rlWR',
    description: null,
    invoice: null,
    last_payment_error: null,
    livemode: false,
    metadata: {
      campaignId: '4c1616b0-1284-4b7d-8b89-9098e7ded2c4',
    },
    next_action: null,
    on_behalf_of: null,
    payment_method: 'pm_1LNwkbKApGjVGa9tmWVdg46e',
    payment_method_options: {
      card: {
        installments: null,
        mandate_options: null,
        network: null,
        request_three_d_secure: 'automatic',
      },
    },
    payment_method_types: ['card'],
    processing: null,
    receipt_email: 'test@gmail.com',
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: 'succeeded',
    transfer_data: null,
    transfer_group: null,
  }

  const billingDetails = getPaymentData(mockPaymentIntentCreated)
  expect(billingDetails.netAmount).toEqual(936)
  expect(billingDetails.chargedAmount).toEqual(1000)
})

it('accept payment-intent.succeeded with US tax included in charge', async () => {
  const mockPaymentIntentCreated: Stripe.PaymentIntent = {
    id: 'pi_3LNziFKApGjVGa9t0sfUl30h',
    object: 'payment_intent',
    amount: 10350,
    amount_capturable: 0,
    amount_details: {
      tip: {},
    },
    amount_received: 10350,
    application: null,
    application_fee_amount: null,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: 'automatic',
    charges: {
      object: 'list',
      data: [
        {
          id: 'ch_3LNziFKApGjVGa9t07WB0NNl',
          object: 'charge',
          amount: 10350,
          amount_captured: 10350,
          amount_refunded: 0,
          application: null,
          application_fee: null,
          application_fee_amount: null,
          balance_transaction: 'txn_3LNziFKApGjVGa9t0H3v9oKL',
          billing_details: {
            address: {
              city: null,
              country: 'BG',
              line1: null,
              line2: null,
              postal_code: null,
              state: null,
            },
            email: 'test@gmail.com',
            name: '42424242',
            phone: null,
          },
          calculated_statement_descriptor: 'PODKREPI.BG',
          captured: true,
          created: 1658411254,
          currency: 'bgn',
          customer: 'cus_M6C76vpsFglyGh',
          description: null,
          destination: null,
          dispute: null,
          disputed: false,
          failure_balance_transaction: null,
          failure_code: null,
          failure_message: null,
          fraud_details: {},
          invoice: null,
          livemode: false,
          metadata: {
            campaignId: 'ef592bd8-edd8-42a0-95c0-0e97d26d8045',
          },
          on_behalf_of: null,
          outcome: {
            network_status: 'approved_by_network',
            reason: null,
            risk_level: 'normal',
            risk_score: 56,
            seller_message: 'Payment complete.',
            type: 'authorized',
          },
          paid: true,
          payment_intent: 'pi_3LNziFKApGjVGa9t0sfUl30h',
          payment_method: 'pm_1LNziyKApGjVGa9tOR1sWkMV',
          payment_method_details: {
            card: {
              brand: 'visa',
              checks: {
                address_line1_check: null,
                address_postal_code_check: null,
                cvc_check: 'pass',
              },
              country: 'US',
              exp_month: 4,
              exp_year: 2024,
              fingerprint: '2BUDwUpZNgnepjrE',
              funding: 'credit',
              installments: null,
              last4: '4242',
              mandate: null,
              network: 'visa',
              three_d_secure: null,
              wallet: null,
            },
            type: 'card',
          },
          receipt_email: 'test@gmail.com',
          receipt_number: null,
          receipt_url:
            'https://pay.stripe.com/receipts/',
          refunded: false,
          refunds: {
            object: 'list',
            data: [],
            has_more: false,
            url: '/v1/charges/ch_3LNziFKApGjVGa9t07WB0NNl/refunds',
          },
          review: null,
          shipping: null,
          source: null,
          source_transfer: null,
          statement_descriptor: null,
          statement_descriptor_suffix: null,
          status: 'succeeded',
          transfer_data: null,
          transfer_group: null,
        },
      ],
      has_more: false,
      url: '/v1/charges?payment_intent=pi_3LNziFKApGjVGa9t0sfUl30h',
    },
    client_secret: null,
    confirmation_method: 'automatic',
    created: 1658411207,
    currency: 'bgn',
    customer: 'cus_M6C76vpsFglyGh',
    description: null,
    invoice: null,
    last_payment_error: null,
    livemode: false,
    metadata: {
      campaignId: 'ef592bd8-edd8-42a0-95c0-0e97d26d8045',
    },
    next_action: null,
    on_behalf_of: null,
    payment_method: 'pm_1LNziyKApGjVGa9tOR1sWkMV',
    payment_method_options: {
      card: {
        installments: null,
        mandate_options: null,
        network: null,
        request_three_d_secure: 'automatic',
      },
    },
    payment_method_types: ['card'],
    processing: null,
    receipt_email: 'test@gmail.com',
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: 'succeeded',
    transfer_data: null,
    transfer_group: null,
  }

  const billingDetails = getPaymentData(mockPaymentIntentCreated)
  expect(billingDetails.netAmount).toEqual(10000)
  expect(billingDetails.chargedAmount).toEqual(10350)
})

it('accept payment-intent.succeeded with GB tax included in charge', async () => {
    const mockPaymentIntentCreated: Stripe.PaymentIntent = {
        "id": "pi_3LO0M5KApGjVGa9t07SXIaeQ",
        "object": "payment_intent",
        "amount": 51333,
        "amount_capturable": 0,
        "amount_details": {
          "tip": {
          }
        },
        "amount_received": 51333,
        "application": null,
        "application_fee_amount": null,
        "automatic_payment_methods": null,
        "canceled_at": null,
        "cancellation_reason": null,
        "capture_method": "automatic",
        "charges": {
          "object": "list",
          "data": [
            {
              "id": "ch_3LO0M5KApGjVGa9t0KGO6jEG",
              "object": "charge",
              "amount": 51333,
              "amount_captured": 51333,
              "amount_refunded": 0,
              "application": null,
              "application_fee": null,
              "application_fee_amount": null,
              "balance_transaction": "txn_3LO0M5KApGjVGa9t0nyzXKN6",
              "billing_details": {
                "address": {
                  "city": null,
                  "country": "BG",
                  "line1": null,
                  "line2": null,
                  "postal_code": null,
                  "state": null
                },
                "email": "test@gmail.com",
                "name": "uk card",
                "phone": null
              },
              "calculated_statement_descriptor": "PODKREPI.BG",
              "captured": true,
              "created": 1658413695,
              "currency": "bgn",
              "customer": "cus_M6ClvMHGb5Y4LI",
              "description": null,
              "destination": null,
              "dispute": null,
              "disputed": false,
              "failure_balance_transaction": null,
              "failure_code": null,
              "failure_message": null,
              "fraud_details": {
              },
              "invoice": null,
              "livemode": false,
              "metadata": {
                "campaignId": "ef592bd8-edd8-42a0-95c0-0e97d26d8045"
              },
              "on_behalf_of": null,
              "outcome": {
                "network_status": "approved_by_network",
                "reason": null,
                "risk_level": "normal",
                "risk_score": 13,
                "seller_message": "Payment complete.",
                "type": "authorized"
              },
              "paid": true,
              "payment_intent": "pi_3LO0M5KApGjVGa9t07SXIaeQ",
              "payment_method": "pm_1LO0MLKApGjVGa9tT5zcUHVU",
              "payment_method_details": {
                "card": {
                  "brand": "visa",
                  "checks": {
                    "address_line1_check": null,
                    "address_postal_code_check": null,
                    "cvc_check": "pass"
                  },
                  "country": "GB",
                  "exp_month": 12,
                  "exp_year": 2031,
                  "fingerprint": "4rDyVIWfTHNh1yf5",
                  "funding": "debit",
                  "installments": null,
                  "last4": "0005",
                  "mandate": null,
                  "network": "visa",
                  "three_d_secure": null,
                  "wallet": null
                },
                "type": "card"
              },
              "receipt_email": "test@gmail.com",
              "receipt_number": null,
              "receipt_url": "https://pay.stripe.com/receipts/",
              "refunded": false,
              "refunds": {
                "object": "list",
                "data": [
                ],
                "has_more": false,
                "url": "/v1/charges/ch_3LO0M5KApGjVGa9t0KGO6jEG/refunds"
              },
              "review": null,
              "shipping": null,
              "source": null,
              "source_transfer": null,
              "statement_descriptor": null,
              "statement_descriptor_suffix": null,
              "status": "succeeded",
              "transfer_data": null,
              "transfer_group": null
            }
          ],
          "has_more": false,
          "url": "/v1/charges?payment_intent=pi_3LO0M5KApGjVGa9t07SXIaeQ"
        },
        "client_secret": null,
        "confirmation_method": "automatic",
        "created": 1658413677,
        "currency": "bgn",
        "customer": "cus_M6ClvMHGb5Y4LI",
        "description": null,
        "invoice": null,
        "last_payment_error": null,
        "livemode": false,
        "metadata": {
          "campaignId": "ef592bd8-edd8-42a0-95c0-0e97d26d8045"
        },
        "next_action": null,
        "on_behalf_of": null,
        "payment_method": "pm_1LO0MLKApGjVGa9tT5zcUHVU",
        "payment_method_options": {
          "card": {
            "installments": null,
            "mandate_options": null,
            "network": null,
            "request_three_d_secure": "automatic"
          }
        },
        "payment_method_types": [
          "card"
        ],
        "processing": null,
        "receipt_email": "test@gmail.com",
        "review": null,
        "setup_future_usage": null,
        "shipping": null,
        "source": null,
        "statement_descriptor": null,
        "statement_descriptor_suffix": null,
        "status": "succeeded",
        "transfer_data": null,
        "transfer_group": null
      }
  
    const billingDetails = getPaymentData(mockPaymentIntentCreated)
    expect(billingDetails.netAmount).toEqual(50000)
    expect(billingDetails.chargedAmount).toEqual(51333)
  })



