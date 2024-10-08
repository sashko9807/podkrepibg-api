import { STRIPE_CLIENT_TOKEN } from '@golevelup/nestjs-stripe'
import { NotAcceptableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import {
  Campaign,
  CampaignState,
  Currency,
  PaymentStatus,
  DonationType,
  PaymentProvider,
  Person,
  Vault,
  Payment,
} from '@prisma/client'
import { CampaignService } from '../campaign/campaign.service'
import { ExportService } from '../export/export.service'
import { PersonService } from '../person/person.service'
import { MockPrismaService, prismaMock } from '../prisma/prisma-client.mock'
import { NotificationModule } from '../sockets/notifications/notification.module'
import { VaultService } from '../vault/vault.service'
import { DonationsController } from './donations.controller'
import { DonationsService } from './donations.service'

import { UpdatePaymentDto } from './dto/update-payment.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { MarketingNotificationsModule } from '../notifications/notifications.module'
import type { PaymentWithDonation } from './types/donation'
import { personMock } from '../person/__mock__/personMock'

describe('DonationsController', () => {
  let controller: DonationsController
  let vaultService: VaultService

  const mockDonation = {
    id: '1234',
    paymentId: '123',
    type: DonationType.donation,
    amount: 10,
    targetVaultId: '1000',
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2022-01-02'),
    personId: personMock.id,
    person: {
      id: personMock.id,
      keycloakId: '00000000-0000-0000-0000-000000000015',
    },
  }

  const mockPayment: PaymentWithDonation = {
    id: personMock.id,
    provider: PaymentProvider.bank,
    currency: Currency.BGN,
    type: 'single',
    status: PaymentStatus.succeeded,
    amount: 10,
    affiliateId: null,
    extCustomerId: '',
    extPaymentIntentId: 'pm1',
    extPaymentMethodId: 'bank',
    billingEmail: personMock.email,
    billingName: 'Admin Dev',
    chargedAmount: 10.5,
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2022-01-02'),
    donations: [mockDonation],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationModule, MarketingNotificationsModule],
      controllers: [DonationsController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        CampaignService,
        DonationsService,
        VaultService,
        MockPrismaService,
        PersonService,
        ExportService,
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile()

    controller = module.get<DonationsController>(DonationsController)
    vaultService = module.get<VaultService>(VaultService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should update a donations donor, when it is changed', async () => {
    const updatePaymentDto = {
      amount: 10,
      targetPersonId: '2',
      donationId: '123',
    }

    const existingPayment = { ...mockPayment }
    const existingTargetPerson: Person = personMock

    jest.spyOn(prismaMock, '$transaction').mockImplementation((callback) => callback(prismaMock))
    const mockedIncrementVaultAmount = jest
      .spyOn(vaultService, 'incrementVaultAmount')
      .mockImplementation()

    prismaMock.payment.findFirst.mockResolvedValueOnce(existingPayment)
    prismaMock.person.findFirst.mockResolvedValueOnce(existingTargetPerson)

    // act
    await controller.update('123', updatePaymentDto)

    // assert
    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: {
        status: PaymentStatus.succeeded,
        billingEmail: undefined,
        donations: {
          update: {
            where: { id: updatePaymentDto.donationId },
            data: {
              personId: existingPayment.donations[0].personId,
            },
          },
        },
      },
    })
    expect(mockedIncrementVaultAmount).toHaveBeenCalledTimes(0)
  })

  it('should update a donation status, when it is changed', async () => {
    const updatePaymentDto: UpdatePaymentDto = {
      type: 'single',
      amount: 10,
      status: PaymentStatus.succeeded,
      targetPersonId: mockDonation.personId,
      billingEmail: mockPayment.billingEmail as string,
      donationId: '123',
    }

    const existingTargetPerson: Person = personMock

    const existingPayment = { ...mockPayment, status: PaymentStatus.initial }
    const expectedUpdatedPayment = { ...existingPayment, status: PaymentStatus.succeeded }

    jest.spyOn(prismaMock, '$transaction').mockImplementation((callback) => callback(prismaMock))

    prismaMock.payment.findFirst.mockResolvedValueOnce(existingPayment)
    prismaMock.person.findFirst.mockResolvedValueOnce(existingTargetPerson)
    prismaMock.payment.update.mockResolvedValueOnce(expectedUpdatedPayment)
    prismaMock.vault.update.mockResolvedValueOnce({ id: '1000', campaignId: '111' } as Vault)

    // act
    await controller.update('123', updatePaymentDto)

    // assert
    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: {
        status: PaymentStatus.succeeded,
        billingEmail: updatePaymentDto.billingEmail,
        donations: {
          update: {
            where: { id: updatePaymentDto.donationId },
            data: {
              personId: existingPayment.donations[0].personId,
            },
          },
        },
      },
    })
    expect(prismaMock.vault.update).toHaveBeenCalledWith({
      where: { id: existingPayment.donations[0].targetVaultId },
      data: {
        amount: {
          increment: existingPayment.donations[0].amount,
        },
      },
    })
  })

  it('should invalidate a donation and update the vault if needed', async () => {
    const existingPayment = { ...mockPayment, status: PaymentStatus.succeeded }
    jest.spyOn(prismaMock, '$transaction').mockImplementation((callback) => callback(prismaMock))

    prismaMock.payment.findFirstOrThrow.mockResolvedValueOnce(existingPayment)

    await controller.invalidate('123')

    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: {
        status: PaymentStatus.invalid,
      },
    })
    expect(prismaMock.vault.update).toHaveBeenCalledWith({
      where: { id: existingPayment.donations[0].targetVaultId },
      data: {
        amount: {
          decrement: existingPayment.donations[0].amount,
        },
      },
    })
  })
})
