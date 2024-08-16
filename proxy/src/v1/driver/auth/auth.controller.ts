import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, ResendOtpDto, VerifyOtpDto } from './auth.dto';

@ApiTags('driver-authentication')
@Controller('v1/drivers/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
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

  @Post('/verify-otp')
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

  @Post('/resend-otp')
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
