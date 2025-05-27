import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

// eslint-disable-next-line unicorn/prevent-abbreviations
export class ConfirmUserParamDto {
  @IsString()
  @ApiProperty({
    description: "The confirmation code sent to the user's email.",
    example: '123456',
  })
  confirmationCode!: string;
}
