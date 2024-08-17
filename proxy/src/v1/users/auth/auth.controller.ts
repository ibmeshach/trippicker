import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, ResendOtpDto, SignUpDto, VerifyOtpDto } from './auth.dto';
import { CustomException } from 'src/custom.exception';

@ApiTags('user-authentication')
@Controller('v1/users/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiResponse({
    status: 201,
    description: 'User logged in successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: LoginDto,
    description: 'Json structure for logging users',
  })
  async login(@Body() body: LoginDto): Promise<any> {
    return await this.authService.login(body);
  }

  @Post('signup')
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: SignUpDto,
    description: 'Json structure for registering users',
  })
  async register(@Body() body: SignUpDto): Promise<any> {
    return await this.authService.signup(body);
  }

  @Post('verify-otp')
  @ApiResponse({
    status: 201,
    description: 'Otp verified successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: VerifyOtpDto,
    description: 'Json structure for verifying otp',
  })
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<any> {
    return await this.authService.verifyOtp(body);
  }

  @Post('resend-otp')
  @ApiResponse({
    status: 201,
    description: 'Otp sent successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: ResendOtpDto,
    description: 'Json structure for verifying otp',
  })
  async resendOtp(@Body() body: ResendOtpDto): Promise<any> {
    return await this.authService.resendOtp(body);
  }
}
