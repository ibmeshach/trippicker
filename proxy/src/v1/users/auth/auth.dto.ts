import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Phone number must be between 10 and 11 digits long',
  })
  @ApiProperty({
    example: '08012345678',
    required: true,
  })
  phoneNumber: string;
}

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Great light',
    required: true,
  })
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Phone number must be between 10 and 11 digits long',
  })
  @ApiProperty({
    example: '08012345678',
    required: true,
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'lightgreat@gmail.com',
    required: true,
  })
  email: string;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Phone number must be between 10 and 11 digits long',
  })
  @ApiProperty({
    example: '08012345678',
    required: true,
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'OTP code must be exactly 4 digits long',
  })
  @ApiProperty({
    example: '1234',
    required: true,
  })
  otpCode: string;
}

export class ResendOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Phone number must be between 10 and 11 digits long',
  })
  @ApiProperty({
    example: '08012345678',
    required: true,
  })
  phoneNumber: string;
}
