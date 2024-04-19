import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

export class createUnregisteredPersonDto {
  @ApiProperty()
  @Expose()
  @IsString()
  firstName: string

  @ApiProperty()
  @Expose()
  @IsString()
  lastName: string

  @ApiProperty()
  @Expose()
  @IsString()
  email: string

  registered: boolean = false
}
