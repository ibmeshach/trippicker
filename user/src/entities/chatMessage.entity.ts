import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { User } from './user.entity';
import { Ride } from './rides.entity';

@Entity()
export class ChatMessage extends BaseModel {
  @Column({ nullable: false })
  owner: boolean;

  @Column({ unique: true, nullable: false })
  rideId: string;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false })
  userId: string;

  @OneToOne(() => Ride)
  @JoinColumn()
  ride: Ride;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn({ name: 'userId' })
  user: User;
}
