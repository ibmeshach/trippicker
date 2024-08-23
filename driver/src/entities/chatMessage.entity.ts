import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { Ride } from './rides.entity';
import { Driver } from './driver.entity';

@Entity()
export class ChatMessage extends BaseModel {
  @Column({ nullable: false })
  owner: boolean;

  @Column({ unique: true, nullable: false })
  rideKey: string;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false })
  driverId: string;

  @OneToOne(() => Ride)
  ride: Ride;

  @ManyToOne(() => Driver, (user) => user.chats)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;
}
