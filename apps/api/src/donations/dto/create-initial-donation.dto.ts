import { ApiProperty } from '@nestjs/swagger'
import { Currency, DonationStatus, DonationType, PaymentProvider, Prisma } from '@prisma/client'
import { Expose } from 'class-transformer'
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'

@Expose()
export class CreateInitialDonation {
  @Expose()
  @ApiProperty({ enum: DonationType })
  type: DonationType


    @Expose()
  @ApiProperty()
  campaignId: string

  @Expose()
  @ApiProperty({ enum: DonationStatus })
  status: DonationStatus

  @Expose()
  @ApiProperty({ enum: PaymentProvider })
  provider: PaymentProvider

  @Expose()
  @ApiProperty({ enum: Currency })
  currency: Currency

  @Expose()
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  amount: number

  @Expose()
  @ApiProperty()
  @IsString()
  @IsOptional()
  extCustomerId: string

  @Expose()
  @ApiProperty()
  @IsString()
  @IsOptional()
  extPaymentIntentId: string

  @Expose()
  @ApiProperty()
  @IsString()
  @IsOptional()
  extPaymentMethodId: string

  @Expose()
  @IsString()
  personEmail: string

  @Expose()
  @ApiProperty()
  isAnonymous: boolean

  public toEntity(paymentReference:string, paymentId:string, targetVaultId:string): Prisma.DonationCreateInput {
    return {
      type: this.type,
      status: DonationStatus.initial,
      provider: this.provider,
      currency: this.currency,
      amount: this.amount,
      //There is no payment intent when creating initial donation. Thus generating one, which will be later replaced with the ones coming from IRIS.
      extCustomerId: this.extCustomerId ?? '',
      extPaymentIntentId: paymentId,
      extPaymentMethodId: this.extPaymentMethodId ?? '',
      billingEmail: this.personEmail,
      paymentReference: paymentReference,
      targetVault: {
        connect: {
          id: targetVaultId,
        },
      },
      person: this.isAnonymous === false ? {connect: {email:this.personEmail}} : {},      
    }
  }


}