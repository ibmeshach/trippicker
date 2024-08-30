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
import { DataSource, QueryRunner } from 'typeorm';
import { Driver } from 'src/entities/driver.entity';

@Controller('ride')
export class RideController {
  private queryRunner: QueryRunner;

  constructor(
    private dataSource: DataSource,
    private readonly rideService: RideService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly driverService: DriverService,
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  @MessagePattern('user.acceptedRide')
  async acceptedRide(@Payload() { data }: { data: UserRideResponseProps }) {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    try {
      if (!data.action)
        throw new CustomException(
          'Driver has not accepted the ride',
          HttpStatus.BAD_REQUEST,
        );

      let driver = await this.queryRunner.manager.findOne(Driver, {
        where: { phoneNumber: data.driver.phoneNumber },
      });

      const driverId = data.driver.id;
      delete data.driver.id;
      if (!driver) {
        // Create a new driver if it does not exist
        driver = this.queryRunner.manager.create(Driver, data.driver);
        await this.queryRunner.manager.save(driver);
      } else {
        // Update the existing driver if needed
        await this.queryRunner.manager.update(
          Driver,
          { phoneNumber: data.user.phoneNumber },
          data.driver,
        );
      }

      const user = await this.userService.findUserById(data.user.id);

      const createRideData = {
        ...data,
        userPhoneNumber: user.phoneNumber,
        driverPhoneNumber: driver.phoneNumber,
        duration: data.duration.toString(),
        distance: data.range,
      };

      const ride = this.queryRunner.manager.create(Ride, createRideData);
      await this.queryRunner.manager.save(ride);
      await this.queryRunner.manager.save(driver);

      await this.queryRunner.commitTransaction();
      return {
        ...ride,
        driverId,
        originAddress: data.originAddress,
        destinationAddreses: data.destinationAddresses,
      };
    } catch (err) {
      console.log('error', err);
      await this.queryRunner.rollbackTransaction();
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
