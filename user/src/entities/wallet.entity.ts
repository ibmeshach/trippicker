import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Wallet extends BaseModel {
  @Column({ nullable: false })
  @Index()
  userId: string;

  @Column({ nullable: false, default: 0.0 })
  coinBalance: number;

  @Column({ nullable: false, default: 0.0 })
  nairaBalance: number;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'userId',
  })
  user: User;
}
