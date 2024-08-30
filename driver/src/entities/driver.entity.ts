import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseModel } from './base.entity';
import { Ride } from './rides.entity';
import { User } from './user.entity';
import { ChatMessage } from './chatMessage.entity';

@Entity()
export class Driver extends BaseModel {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  @Index()
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
  @Index()
  isAvailable: boolean;

  @Column({ default: false })
  @Index()
  isOnline: boolean;

  @Column({ nullable: false, default: 0 }) // rating can be between 1 and 5
  rating?: number;

  @Column({ nullable: false, default: 0 })
  noOfRating: number; // the no of users that have rated this driver

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ default: 0 })
  numberOfRides: number;

  @Column({ default: 0 })
  totalEarnings: number;

  @Column({ nullable: true })
  otpToken?: string;

  @Column({ default: false })
  isPhoneNumberConfirmed: boolean;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @OneToMany(() => Ride, (ride) => ride.driver, {
    onDelete: 'CASCADE',
  })
  rides: Ride[];

  @OneToMany(() => ChatMessage, (chats) => chats.driver, {
    onDelete: 'CASCADE',
  })
  chats: ChatMessage[];

  @OneToMany(() => User, (user) => user.driver)
  users: User[];
}
