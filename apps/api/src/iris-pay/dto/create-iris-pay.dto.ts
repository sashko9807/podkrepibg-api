import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'

export class IrisPayCreateWebhooKDto {
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
