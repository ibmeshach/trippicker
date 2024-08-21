import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from './base.entity';
import { Ride } from './rides.entity';
import { Driver } from './driver.entity';

@Entity('User')
export class User extends BaseModel {
  @Column({ nullable: false })
  fullName: string;

  @Column({ unique: true, nullable: false })
  phoneNumber: string;

  @Column({ default: false })
  isPhoneNumberConfirmed: boolean;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  otpToken?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ type: 'float', nullable: true })
  currentLatitude: number;

  @Column({ type: 'float', nullable: true })
  currentLongitude: number;

  @OneToMany(() => Ride, (ride) => ride.user, {
    onDelete: 'CASCADE',
  })
  rides: Ride[];

  @OneToMany(() => Driver, (driver) => driver.user)
  drivers: Driver[];
}
