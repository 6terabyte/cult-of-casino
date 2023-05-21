'use strict';

import { Field, ObjectType, ID, Int } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'user' })
@Unique(['id', 'email', 'screenName'])
export class UserEntity extends BaseEntity {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  public id: number;

  @Field((type) => String, { nullable: false })
  @Column({ name: 'name', nullable: false })
  public name: string;

  @Field((type) => String, { nullable: false })
  @Column({ name: 'screen_name', nullable: false })
  public screenName!: string;

  @Field((type) => String, { nullable: true })
  @Column({ name: 'email', nullable: true })
  public email!: string;

  @Field((type) => String, { nullable: false })
  @Column({ name: 'hash', nullable: false })
  public hash!: string;

  @Field((type) => String, { nullable: true })
  @Column({ name: 'email_change_temp', nullable: true })
  public emailChangeTemp?: string;

  @Field((type) => String, { nullable: true })
  @Column({ name: 'auth', nullable: true })
  public auth?: string;

  @Field((type) => String, { nullable: true })
  @Column({ name: 'session', nullable: true })
  public session?: string;

  @Field((type) => String, { nullable: false })
  @Column({ name: 'role', nullable: false, default: 'user' })
  public role!: string;

  @Field((type) => Int, { defaultValue: 200 })
  @Column({ name: 'chip', nullable: false, default: 200 })
  public chip: number;

  @Field((type) => Int, { nullable: true })
  @Column({ name: 'chip_temp', nullable: true })
  public chipTemp?: number;

  @Field((type) => Boolean, { nullable: false })
  @Column({ name: 'using', nullable: false, default: true })
  public using: boolean;

  @Field()
  @CreateDateColumn()
  public created: Date;

  @Field()
  @UpdateDateColumn()
  public updated: Date;
}
