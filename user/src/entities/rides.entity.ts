import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Driver } from './driver.entity';
import { BaseModel } from './base.entity';
import { User } from './user.entity';
import { ChatMessage } from './chatMessage.entity';

@Entity()
export class Ride extends BaseModel {
  @Column({ unique: true, nullable: false })
  rideId: string;

  @Column({ default: 'booked' })
  status: 'booked' | 'arrived' | 'started' | 'ended' | 'cancelled';

  @Column({ nullable: false })
  duration: string;

  @Column('jsonb')
  origin: { lat: number; lng: number };

  @Column('simple-json', { nullable: false })
  destination: { lat: number; lng: number }[];

  @Column('float', { nullable: false })
  cost: number;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentStatus: string;

  @Column({ nullable: true })
  distance: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({ nullable: true })
  driverRating: number;

  @Column({ nullable: true })
  userRating: number;

  @OneToOne(() => ChatMessage, (chatMessage) => chatMessage.ride)
  chatMessage: ChatMessage;

  @Column({ nullable: false })
  userPhoneNumber: string;

  @Column({ nullable: false })
  driverPhoneNumber: string;

  @Column({ type: 'float', nullable: false, default: 0.0 })
  coinMined: number;

  @ManyToOne(() => User, (user) => user.rides)
  @JoinColumn({
    name: 'userPhoneNumber',
    referencedColumnName: 'phoneNumber',
  })
  user: User;

  @ManyToOne(() => Driver, (driver) => driver.rides)
  @JoinColumn({
    name: 'driverPhoneNumber',
    referencedColumnName: 'phoneNumber',
  })
  driver: Driver;
}
