import { Expose } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator'
import { DonationType } from '@prisma/client'

export class CreateDonationPaymentDto {
  @ApiProperty({ description: 'ConfirmationToken created by Stripe.js from the payment form' })
  @Expose()
  @IsString()
  @Matches(/^ctoken_/)
  public readonly confirmationTokenId: string

  @ApiProperty()
  @Expose()
  @IsUUID()
  public readonly campaignId: string

  @ApiProperty({ description: 'Amount in the smallest currency unit (cents)' })
  @Expose()
  @IsInt()
  @Min(100, { message: 'Minimum donation amount in cents is 100' })
  public readonly amount: number

  @ApiProperty({ enum: DonationType })
  @Expose()
  @IsEnum(DonationType)
  public readonly type: DonationType

  @ApiProperty()
  @Expose()
  @IsBoolean()
  public readonly isAnonymous: boolean

  @ApiPropertyOptional({ description: 'Ignored for subscriptions, the logged in user is used' })
  @Expose()
  @IsOptional()
  @IsUUID()
  public readonly personId?: string

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly wish?: string
}
