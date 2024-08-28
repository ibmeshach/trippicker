import {
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CustomException } from 'src/custom.exception';
import { RideService } from './ride.service';
import { Ride } from 'src/entities/rides.entity';
import { UserService } from 'src/user/user.service';
import { WalletService } from 'src/wallet/wallet.service';
import { catchError, firstValueFrom } from 'rxjs';
import { CancelRideEvent } from './ride.events';
import { DriverService } from 'src/driver/driver.service';

@Controller('ride')
export class RideController {
  constructor(
    private readonly rideService: RideService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly driverService: DriverService,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
  ) {}

  @MessagePattern('user.trackRide')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCurrentLocation(@Payload() { data }: { data: { rideId: string } }) {
    try {
      const ride: Ride = await this.rideService.findActiveRideById(data.rideId);

      const user = await this.userService.findUserByPhoneNumber(
        ride.userPhoneNumber,
      );

      if (!user)
        throw new CustomException(
          'Enter a valid rideId',
          HttpStatus.BAD_REQUEST,
        );

      return {
        ride,
        id: user.id,
        location: {
          address: user.address,
          lat: user.currentLatitude,
          lng: user.currentLongitude,
        },
      };
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

  @MessagePattern('user.cancelRide')
  async cancelRide(
    @Payload() { data }: { data: { userId: string; rideId: string } },
  ) {
    try {
      const user = await this.userService.findUserById(data.userId);

      if (!user)
        throw new CustomException(
          'Enter a valid userId',
          HttpStatus.BAD_REQUEST,
        );

      const ride = await this.rideService.updateRideAndReturn(data.rideId, {
        status: 'cancelled',
      });

      const driver = await this.driverService.findDriverByPhoneNumber(
        ride.driverPhoneNumber,
      );

      const observableData = this.driversClient
        .send(
          'driver.cancelRide',
          new CancelRideEvent({
            phoneNumber: driver.phoneNumber,
            rideId: data.rideId,
          }),
        )
        .pipe(
          catchError((error) => {
            throw error;
          }),
        );

      await firstValueFrom(observableData);
      return { status: true };
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

  @MessagePattern('user.arrivedTrip')
  async arrivedTrip(@Payload() { data }: { data: RideArrivedTripProps }) {
    try {
      const user = await this.userService.findUserByPhoneNumber(
        data.phoneNumber,
      );

      if (!user)
        throw new CustomException(
          'Enter a valid user phoneNumber',
          HttpStatus.BAD_REQUEST,
        );

      await this.rideService.updateRideStatus(data.rideId, data.phoneNumber, {
        status: 'arrived',
      });

      return { status: true };
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

  @MessagePattern('user.startTrip')
  async startTrip(@Payload() { data }: { data: RideStartTripProps }) {
    try {
      const user = await this.userService.findUserByPhoneNumber(
        data.phoneNumber,
      );

      if (!user)
        throw new CustomException(
          'Enter a valid user phoneNumber',
          HttpStatus.BAD_REQUEST,
        );

      await this.rideService.updateRideStatus(data.rideId, data.phoneNumber, {
        status: 'started',
      });

      return { status: true };
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

  @MessagePattern('user.endTrip')
  async endTrip(
    @Payload()
    { data }: { data: RideEndTripProps },
  ) {
    try {
      const user = await this.userService.findUserByPhoneNumber(
        data.phoneNumber,
      );

      if (!user)
        throw new CustomException(
          'User with phoneNumber not found',
          HttpStatus.NOT_FOUND,
        );

      const wallet = await this.walletService.findWalletByUserId(user.id);

      if (!wallet)
        throw new CustomException(
          'Wallet with userId not found',
          HttpStatus.NOT_FOUND,
        );

      const ride = await this.rideService.updateRideAndReturn(data.rideId, {
        status: 'ended',
        coinMined: data.coinMined,
      });

      const rate = 8 * Math.pow(10, -3);
      const maxCoin = rate * ride.distance;

      if (data.coinMined >= maxCoin) {
        wallet.coinBalance += maxCoin;
      } else {
        wallet.coinBalance += data.coinMined;
      }

      await wallet.save();

      return { status: true };
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
