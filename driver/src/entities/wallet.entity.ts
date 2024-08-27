import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { Driver } from './driver.entity';

@Entity()
export class Wallet extends BaseModel {
  @Column({ nullable: false })
  @Index()
  driverId: string;

  @Column({ nullable: false, default: 0.0 })
  coinBalance: number;

  @Column({ type: 'float', default: 0.0 })
  coinTotalMillage: number;

  @Column({ nullable: false, default: 0.0 })
  nairaBalance: number;

  @OneToOne(() => Driver)
  @JoinColumn({
    name: 'driverId',
  })
  driver: Driver;
}
