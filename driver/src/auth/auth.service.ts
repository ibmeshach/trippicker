import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from 'src/custom.exception';
import { DriverService } from 'src/driver/driver.service';
import { DriverEntity } from 'src/driver/serializers/driver.serializer';
import { Driver } from 'src/entities/driver.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { SmsService } from 'src/sms/sms.service';
import { WalletService } from 'src/wallet/wallet.service';

import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class AuthService {
  private queryRunner: QueryRunner;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly driverService: DriverService,
    private readonly smsService: SmsService,
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  async registerDriver(body: SignupProps) {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction('SERIALIZABLE');

    try {
      const driver = await this.driverService.findDriverByPhoneNumberLock(
        body.phoneNumber,
        this.queryRunner.manager,
      );

      if (driver) {
        throw new CustomException('User already exists', HttpStatus.FORBIDDEN);
      }

      const createdDriver = this.queryRunner.manager.create(Driver, body);

      await this.queryRunner.manager.save(createdDriver);

      const driverWallet = this.queryRunner.manager.create(Wallet, {
        driverId: createdDriver.id,
      });

      const otpCode = await this.smsService.sendOtp(createdDriver.phoneNumber);
      const token = await this.encodeOptCodeInToken(createdDriver.id, otpCode);

      createdDriver.otpToken = token;
      await this.queryRunner.manager.save(createdDriver);
      await this.queryRunner.manager.save(driverWallet);

      await this.queryRunner.commitTransaction();
      return 'created successfully';
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      throw err;
    }
  }

  async loginDriver(body: LoginProps) {
    try {
      if (!body.phoneNumber)
        throw new CustomException(
          'Invalid phoneNumber',
          HttpStatus.BAD_REQUEST,
        );

      const driver = await this.driverService.findDriverByPhoneNumber(
        body.phoneNumber,
      );

      if (!driver) {
        throw new CustomException(
          'Invalid phoneNumber',
          HttpStatus.BAD_REQUEST,
        );
      }

      const otpCode = await this.smsService.sendOtp(driver.phoneNumber);
      const token = await this.encodeOptCodeInToken(driver.id, otpCode);

      const updatedDriver = await this.driverService.updateOtpToken({
        phoneNumber: body.phoneNumber,
        otpToken: token,
      });

      const driverResponse = new DriverEntity(updatedDriver);

      return 'login successfully, otp sent';
    } catch (err) {
      throw err;
    }
  }

  async verifyOtpCode(body: VerifyOtpCodeProps) {
    const driver = await this.driverService.findDriverByPhoneNumber(
      body.phoneNumber,
    );

    if (!driver)
      throw new CustomException(
        'User not found with phoneNumber',
        HttpStatus.NOT_FOUND,
      );

    const otp_secret = this.configService.get('OTP_JWT_TOKEN');
    const payload = await this.decodejwtToken(driver.otpToken, otp_secret);

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
      { sub: driver.id },
      jwt_secret,
      null,
    );

    driver.isPhoneNumberConfirmed = true;
    driver.save();

    return { driver, accessToken };
  }

  async resendOtpCode(body: ResendOtpCodeProps) {
    const driver = await this.driverService.findDriverByPhoneNumber(
      body.phoneNumber,
    );

    if (!driver)
      throw new CustomException(
        'User not found with phoneNumber',
        HttpStatus.NOT_FOUND,
      );

    const otpCode = await this.smsService.sendOtp(driver.phoneNumber);
    const token = await this.encodeOptCodeInToken(driver.id, otpCode);

    const updatedDriver = await this.driverService.updateOtpToken({
      phoneNumber: body.phoneNumber,
      otpToken: token,
    });

    if (updatedDriver) return 'otp sent';
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
