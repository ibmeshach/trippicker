import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/custom.exception';
import { SmsService } from 'src/sms/sms.service';
import { UserEntity } from 'src/user/serializers/user.serializer';
import { UserService } from 'src/user/user.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class AuthService {
  private queryRunner: QueryRunner;

  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
    private smsService: SmsService,
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  async registerUser(body: SignupProps) {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction('SERIALIZABLE');

    try {
      const user = await this.userService.findUserByPhoneNumberLock(
        body.phoneNumber,
        this.queryRunner.manager,
      );

      if (user) {
        throw new CustomException('User already exists', HttpStatus.FORBIDDEN);
      }

      const createdUser = this.userService.create(body);

      const otpCode = this.smsService.generateOTP(4);
      const token = await this.encodeOptCodeInToken(createdUser.id, otpCode);

      createdUser.otpToken = token;
      const userResponse = await this.queryRunner.manager.save(createdUser);

      await this.queryRunner.commitTransaction();
      return { user: userResponse, otpCode };
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      throw err;
    }
  }

  async loginUser(body: LoginProps) {
    try {
      if (!body.phoneNumber)
        throw new CustomException(
          'Invalid phoneNumber',
          HttpStatus.BAD_REQUEST,
        );

      const user = await this.userService.findUserByPhoneNumber(
        body.phoneNumber,
      );

      if (!user) {
        throw new CustomException(
          'Invalid phoneNumber',
          HttpStatus.BAD_REQUEST,
        );
      }

      const otpCode = this.smsService.generateOTP(4);
      const token = await this.encodeOptCodeInToken(user.id, otpCode);

      const updatedUser = await this.userService.update({
        phoneNumber: body.phoneNumber,
        otpToken: token,
      });

      const userResponse = new UserEntity(updatedUser);

      return { user: userResponse, otpCode };
    } catch (err) {
      throw err;
    }
  }

  async verifyOtpCode(body: VerifyOtpCodeProps) {
    const user = await this.userService.findUserByPhoneNumber(body.phoneNumber);

    if (!user)
      throw new CustomException(
        'User not found with phoneNumber',
        HttpStatus.NOT_FOUND,
      );

    const otp_secret = this.configService.get('OTP_JWT_TOKEN');
    const payloadCode = await this.verifyjwtToken(user.otpToken, otp_secret);

    if (!payloadCode)
      throw new CustomException(
        'Invalid or expired otp code',
        HttpStatus.BAD_REQUEST,
      );

    if (!(body.otpCode == payloadCode))
      throw new CustomException(
        'Wrong otp code provided',
        HttpStatus.BAD_REQUEST,
      );

    const jwt_secret = this.configService.get<string>('JWT_ACCESS_TOKEN');
    const accessToken = await this.generateToken(
      { sub: user.id },
      jwt_secret,
      null,
    );

    user.isPhoneNumberConfirmed = true;
    user.save();

    return { accessToken };
  }

  async resendOtpCode(body: ResendOtpCodeProps) {
    const user = await this.userService.findUserByPhoneNumber(body.phoneNumber);

    if (!user)
      throw new CustomException(
        'User not found with phoneNumber',
        HttpStatus.NOT_FOUND,
      );

    const otpCode = this.smsService.generateOTP(4);
    const token = await this.encodeOptCodeInToken(user.id, otpCode);

    const updatedUser = await this.userService.update({
      phoneNumber: body.phoneNumber,
      otpToken: token,
    });

    if (updatedUser) return { otpCode };
  }

  async generateToken(payload: {}, secret: string, expire_time: string | null) {
    const options: { secret: string; expiresIn?: string } = { secret };

    if (expire_time) {
      options.expiresIn = expire_time;
    }

    return await this.jwtService.signAsync(payload, options);
  }

  async encodeOptCodeInToken(userId: string, otpCode: string) {
    const secret = this.configService.get<string>('OTP_JWT_TOKEN');

    const token = this.generateToken({ sub: userId, otpCode }, secret, '60s');
    return token;
  }

  async verifyjwtToken(token: string, secret: string) {
    try {
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret,
        });
        return payload.otpCode;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }
}
