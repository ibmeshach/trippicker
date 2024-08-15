import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './base.entity';

@Entity('User')
export class User extends BaseModel {
  @Column({ nullable: false })
  fullName: string;

  @Column({ unique: true, nullable: false })
  phoneNumber: string;

  @Column({ default: false })
  isPhoneNumberConfirmed: boolean;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  otpToken?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  profileImage?: string;
}
