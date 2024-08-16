import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseModel } from './base.entity';
import { Ride } from './rides.entity';
import { User } from './user.entity';

@Entity()
export class Driver extends BaseModel {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column()
  vehicleModel: string;

  @Column()
  vehiclePlateNumber: string;

  @Column({ nullable: true })
  vehicleColor: string;

  @Column({ type: 'float', nullable: true })
  currentLatitude: number;

  @Column({ type: 'float', nullable: true })
  currentLongitude: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  rating: number;

  @Column({ default: 0 })
  numberOfRides: number;

  @Column({ default: 0 })
  totalEarnings: number;

  @OneToMany(() => Ride, (ride) => ride.driver)
  rides: Ride[];

  @OneToMany(() => User, (user) => user.driver)
  users: User[];
}
