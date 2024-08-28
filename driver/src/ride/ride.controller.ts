import {
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { Ride } from 'src/entities/rides.entity';
import { RideService } from './ride.service';
import { DriverService } from 'src/driver/driver.service';
import { CustomException } from 'src/custom.exception';
import { WalletService } from 'src/wallet/wallet.service';
import { catchError, firstValueFrom } from 'rxjs';
import { EndTripEvent, StartTripEvent } from './ride.event';
import { UserService } from 'src/user/user.service';

@Controller('ride')
export class RideController {
  constructor(
    private readonly rideService: RideService,
    private readonly driverService: DriverService,
    private readonly walletService: WalletService,
    private readonly userService: UserService,
    @Inject('USERS') private readonly usersClient: ClientProxy,
  ) {}

  @MessagePattern('driver.trackRide')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCurrentLocation(@Payload() { data }: { data: { rideId: string } }) {
    try {
      const ride: Ride = await this.rideService.findActiveRideById(data.rideId);

      const driver = await this.driverService.findDriverByPhoneNumber(
        ride.driverPhoneNumber,
      );

      if (!driver)
        throw new CustomException(
          'Enter a valid rideId',
          HttpStatus.BAD_REQUEST,
        );

      return {
        ride,
        id: driver.id,
        location: {
          address: driver.address,
          lat: driver.currentLatitude,
          lng: driver.currentLongitude,
        },
      };
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

  @MessagePattern('driver.cancelRide')
  async cancelRide(@Payload() { data }: { data: CancelRideProps }) {
    try {
      const driver = await this.driverService.findDriverByPhoneNumber(
        data.phoneNumber,
      );

      if (!driver)
        throw new CustomException(
          'Enter a valid driverPhoneNumber',
          HttpStatus.BAD_REQUEST,
        );

      await this.rideService.updateRideStatus(data.rideId, data.phoneNumber, {
        status: 'cancelled',
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

  @MessagePattern('driver.arrivedTrip')
  async arrivedTrip(@Payload() { data }: { data: RideStausProps }) {
    try {
      const driver = await this.driverService.findDriverById(data.driverId);

      if (!driver)
        throw new CustomException(
          'Enter a valid driverId',
          HttpStatus.BAD_REQUEST,
        );

      const ride = await this.rideService.updateRideStatusAndReturn(
        data.rideId,
        driver.phoneNumber,
        {
          status: 'arrived',
        },
      );

      const user = await this.userService.findUserByPhoneNumber(
        ride.userPhoneNumber,
      );

      const observableData = this.usersClient
        .send(
          'user.arrivedTrip',
          new StartTripEvent({
            phoneNumber: user.phoneNumber,
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

  @MessagePattern('driver.startTrip')
  async startTrip(@Payload() { data }: { data: RideStausProps }) {
    try {
      const driver = await this.driverService.findDriverById(data.driverId);

      if (!driver)
        throw new CustomException(
          'Enter a valid driverId',
          HttpStatus.BAD_REQUEST,
        );

      const ride = await this.rideService.updateRideStatusAndReturn(
        data.rideId,
        driver.phoneNumber,
        {
          status: 'started',
        },
      );

      const user = await this.userService.findUserByPhoneNumber(
        ride.userPhoneNumber,
      );

      const observableData = this.usersClient
        .send(
          'user.startTrip',
          new StartTripEvent({
            phoneNumber: user.phoneNumber,
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

  @MessagePattern('driver.endTrip')
  async endTrip(
    @Payload()
    { data }: { data: RideEndTripProps },
  ) {
    try {
      const wallet = await this.walletService.findWalletByDriverId(
        data.driverId,
      );

      if (!wallet)
        throw new CustomException(
          'Wallet with driverId not found',
          HttpStatus.NOT_FOUND,
        );

      const ride = await this.rideService.updateRideAndReturn(data.rideId, {
        status: 'ended',
        coinMined: data.coinMined,
      });

      // const user = await this

      const rate = 8 * Math.pow(10, -4);
      const maxCoin = rate * ride.distance;

      if (data.coinMined >= maxCoin) {
        wallet.coinBalance += maxCoin;
      } else {
        wallet.coinBalance += data.coinMined;
      }

      await wallet.save();

      const observableData = this.usersClient
        .send(
          'user.endTrip',
          new EndTripEvent({
            phoneNumber: ride.user.phoneNumber,
            rideId: data.rideId,
            coinMined: data.coinMined,
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
}
