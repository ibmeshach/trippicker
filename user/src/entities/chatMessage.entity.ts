import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { User } from './user.entity';
import { Ride } from './rides.entity';

@Entity()
export class ChatMessage extends BaseModel {
  @Column({ nullable: false })
  owner: boolean;

  @Column({ nullable: false })
  rideId: string;

  @OneToOne(() => Ride)
  @JoinColumn({ name: 'rideId' })
  ride: Ride;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn({ name: 'userId' })
  user: User;
}
