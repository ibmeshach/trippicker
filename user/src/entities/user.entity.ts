import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { Ride } from './rides.entity';
import { Driver } from './driver.entity';
import { ChatMessage } from './chatMessage.entity';
import { Wallet } from './wallet.entity';

@Entity('User')
export class User extends BaseModel {
  @Column({ nullable: false })
  fullName: string;

  @Column({ unique: true, nullable: false })
  @Index()
  phoneNumber: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: false })
  isPhoneNumberConfirmed: boolean;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  otpToken?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: 0 }) // rating can be between  1 and  5
  rating?: number;

  @Column({ default: 0 })
  noOfRating: number; // the no of drivers that have rated this user

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ type: 'float', nullable: true })
  currentLatitude: number;

  @Column({ type: 'float', nullable: true })
  currentLongitude: number;

  @OneToOne(() => Wallet)
  coinWallet: Wallet;

  @OneToMany(() => Ride, (ride) => ride.user, {
    onDelete: 'CASCADE',
  })
  rides: Ride[];

  @OneToMany(() => ChatMessage, (chats) => chats.user, {
    onDelete: 'CASCADE',
  })
  chats: ChatMessage[];

  @OneToMany(() => Driver, (driver) => driver.user)
  drivers: Driver[];
}
