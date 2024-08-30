import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from './base.entity';
import { Ride } from './rides.entity';
import { User } from './user.entity';

@Entity()
export class Driver extends BaseModel {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: false })
  phoneNumber: string;

  @Column({ nullable: true })
  bio?: string;

  @Column()
  licenseNumber: string;

  @Column()
  vehicleModel: string;

  @Column()
  vehiclePlateNumber: string;

  @Column()
  vehicleColor: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'float', nullable: true })
  currentLatitude: number;

  @Column({ type: 'float', nullable: true })
  currentLongitude: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  rating?: number;

  @Column({ default: 0 })
  noOfRating: number; // the no of users that have rated this driver

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ default: 0 })
  numberOfRides: number;

  @Column({ nullable: true })
  otpToken?: string;

  @Column({ default: 0 })
  totalEarnings: number;

  @Column({ default: false })
  isPhoneNumberConfirmed: boolean;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @OneToMany(() => Ride, (ride) => ride.driver, {
    onDelete: 'CASCADE',
  })
  rides: Ride[];

  @ManyToOne(() => User, (user) => user.drivers)
  user: User;
}
