import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './serializers/user.serializer';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @MessagePattern('user.updateLocation')
  @UseInterceptors(ClassSerializerInterceptor)
  async updateLocation(
    @Payload() { data }: { data: LocationEventPayloadProps },
  ) {
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_TOKEN');
      const payload = await this.userService.decodejwtToken(data.token, secret);

      if (!payload)
        throw new CustomException(
          'Invalid or expired jwt token',
          HttpStatus.BAD_REQUEST,
        );

      const userId = payload.sub;

      const userCurrentLocationData = {
        address: data.address,
        currentLatitude: data.currentLatitude,
        currentLongitude: data.currentLongitude,
      };

      await this.userService.updateUserLocation(
        userId,
        userCurrentLocationData,
      );

      // const drivers = await this.userService.getNearestDrivers({
      //   userLatitude: data.currentLatitude,
      //   userLongitude: data.currentLongitude,
      // });

      return userCurrentLocationData;
    } catch (err) {
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @MessagePattern('user.userDetails')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUserDetails(@Payload() { data }: { data: { id: string } }) {
    try {
      console.log(data);

      const user = await this.userService.findUserById(data.id);

      if (!user)
        throw new CustomException('User not found', HttpStatus.NOT_FOUND);

      const responseUser = new UserEntity(user);

      return { user: responseUser };
    } catch (err) {
      console.log(err);
      if (err instanceof CustomException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
