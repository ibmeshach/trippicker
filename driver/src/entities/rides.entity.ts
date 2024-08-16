import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { BaseModel } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Ride extends BaseModel {
  @Column({ default: 'requested' })
  status: string;

  @CreateDateColumn()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column('point', { nullable: true })
  startLocation: { x: number; y: number }; // Assuming Postgres, use 'point' for geographic coordinates

  @Column('point', { nullable: true })
  endLocation: { x: number; y: number };

  @Column('float', { nullable: true })
  estimatedFare: number;

  @Column('float', { nullable: true })
  finalFare: number;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentStatus: string;

  @Column({ nullable: true })
  distance: number;

  @Column('float', { nullable: true })
  duration: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({ nullable: true })
  driverRating: number;

  @Column({ nullable: true })
  userRating: number;

  @ManyToOne(() => User, (user) => user.rides)
  user: User;

  @ManyToOne(() => Driver, (driver) => driver.rides)
  driver: Driver;
}
