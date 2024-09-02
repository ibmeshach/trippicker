import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/custom.exception';
import { User } from 'src/entities/user.entity';
import { Wallet } from 'src/entities/wallet.entity';
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

      const createdUser = this.queryRunner.manager.create(User, body);

      await this.queryRunner.manager.save(createdUser);

      const userWallet = this.queryRunner.manager.create(Wallet, {
        userId: createdUser.id,
      });

      const otpCode = await this.smsService.sendOtp(createdUser.phoneNumber);
      const token = await this.encodeOptCodeInToken(createdUser.id, otpCode);

      createdUser.otpToken = token;
      await this.queryRunner.manager.save(createdUser);
      await this.queryRunner.manager.save(userWallet);

      await this.queryRunner.commitTransaction();
      return 'created successfully';
    } catch (err) {
      console.log('error', err);
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

      const otpCode = await this.smsService.sendOtp(user.phoneNumber);

      const token = await this.encodeOptCodeInToken(user.id, otpCode);

      const updatedUser = await this.userService.updateOtpToken({
        phoneNumber: body.phoneNumber,
        otpToken: token,
      });

      const userResponse = new UserEntity(updatedUser);

      console.log({ user: userResponse });
      return 'login successfully, otp sent';
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
    const payload = await this.decodejwtToken(user.otpToken, otp_secret);

    if (!payload)
      throw new CustomException(
        'Invalid or expired otp code',
        HttpStatus.BAD_REQUEST,
      );

    if (!(body.otpCode == payload.otpCode))
      throw new CustomException(
        'Wrong otp code provided',
        HttpStatus.BAD_REQUEST,
      );

    const jwt_secret = this.configService.get<string>('JWT_ACCESS_TOKEN');
    const accessToken = await this.generateToken(
      { sub: user.id, email: user.email, fullName: user.fullName },
      jwt_secret,
      null,
    );

    user.isPhoneNumberConfirmed = true;
    user.save();

    return { user, accessToken };
  }

  async resendOtpCode(body: ResendOtpCodeProps) {
    const user = await this.userService.findUserByPhoneNumber(body.phoneNumber);

    if (!user)
      throw new CustomException(
        'User not found with phoneNumber',
        HttpStatus.NOT_FOUND,
      );

    const otpCode = await this.smsService.sendOtp(user.phoneNumber);
    const token = await this.encodeOptCodeInToken(user.id, otpCode);

    await this.userService.updateOtpToken({
      phoneNumber: body.phoneNumber,
      otpToken: token,
    });

    if (user) return 'otp sent';
  }

  async verifyEmailOtpCode(data: VerifyEmailOtpCodeProps) {
    const user = await this.userService.findUserByEmail(data.email);

    if (!user)
      throw new CustomException(
        'User not found with phoneNumber',
        HttpStatus.NOT_FOUND,
      );

    const otp_secret = this.configService.get('OTP_JWT_TOKEN');
    const payload = await this.decodejwtToken(user.otpToken, otp_secret);

    if (!payload)
      throw new CustomException(
        'Invalid or expired otp code',
        HttpStatus.BAD_REQUEST,
      );

    if (!(data.otpCode == payload.otpCode))
      throw new CustomException(
        'Wrong otp code provided',
        HttpStatus.BAD_REQUEST,
      );

    user.isEmailConfirmed = true;
    user.save();

    return { status: true };
  }

  async sendEmailOtp(data: sendEmailOtpCodeProps) {
    const user = await this.userService.findUserByEmail(data.email);

    if (!user)
      throw new CustomException(
        'User with email not found',
        HttpStatus.NOT_FOUND,
      );

    const otpCode = this.generateOTPCode(4);
    const token = await this.encodeOptCodeInToken(user.id, otpCode);

    await this.userService.updateOtpToken({
      phoneNumber: user.phoneNumber,
      otpToken: token,
    });
  }

  generateOTPCode(length: number) {
    const characters = '0123456789';
    let otpCode = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otpCode += characters.charAt(randomIndex);
    }
    return otpCode;
  }

  async generateToken(
    payload: {
      sub: string;
      otpCode?: string;
      email?: string;
      fullName?: string;
    },
    secret: string,
    expire_time: string | null,
  ) {
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

  async decodejwtToken(token: string, secret: string) {
    try {
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret,
        });
        return payload;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }
}
