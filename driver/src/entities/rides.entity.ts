import { Entity, Column, ManyToOne } from 'typeorm';
import { Driver } from './driver.entity';
import { BaseModel } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Ride extends BaseModel {
  @Column({ nullable: false })
  status: string;

  @Column({ nullable: false })
  duration: string;

  @Column('point', { nullable: false })
  origin: { lat: number; lng: number }; // Assuming Postgres, use 'point' for geographic coordinates

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

  @ManyToOne(() => User, (user) => user.rides, {
    nullable: true,
  })
  user: User;

  @ManyToOne(() => Driver, (driver) => driver.rides, {
    nullable: true,
  })
  driver: Driver;
}
