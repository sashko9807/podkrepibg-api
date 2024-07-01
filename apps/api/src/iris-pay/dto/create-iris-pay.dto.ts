import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { IrisCreateCustomerDto } from './create-iris-customer'

export class IRISCreateCheckoutSessionDto extends IrisCreateCustomerDto {
  @ApiProperty()
  @IsString()
  @Expose()
  campaignId: string

  @ApiProperty()
  @IsString()
  @Expose()
  @IsOptional()
  state: string

  @ApiProperty()
  @IsString()
  @Expose()
  @IsOptional()
  successUrl: string

  @ApiProperty()
  @IsString()
  @Expose()
  @IsOptional()
  errorUrl: string
}
