import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseModel } from './base.entity';
import { Ride } from './rides.entity';
import { User } from './user.entity';

@Entity()
export class Driver extends BaseModel {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  @Index()
  phoneNumber: string;

  @Column()
  licenseNumber: string;

  @Column()
  vehicleModel: string;

  @Column()
  vehiclePlateNumber: string;

  @Column()
  vehicleColor: string;

  @Column({ type: 'float', nullable: true })
  currentLatitude: number;

  @Column({ type: 'float', nullable: true })
  currentLongitude: number;

  @Column({ default: true })
  @Index()
  isAvailable: boolean;

  @Column({ default: false })
  @Index()
  isOnline: boolean;

  @Column({ nullable: true })
  rating: number;

  @Column({ default: 0 })
  numberOfRides: number;

  @Column({ default: 0 })
  totalEarnings: number;

  @Column({ nullable: true })
  otpToken?: string;

  @Column({ default: false })
  isPhoneNumberConfirmed: boolean;

  @OneToMany(() => Ride, (ride) => ride.driver)
  rides: Ride[];

  @OneToMany(() => User, (user) => user.driver)
  users: User[];
}
