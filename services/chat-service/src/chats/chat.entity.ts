import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from '../messages/message.entity';

@Entity('chats')
@ObjectType()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column('text', { array: true })
  @Field(() => [String])
  participants: string[];

  @OneToMany(() => Message, message => message.chat)
  @Field(() => [Message], { nullable: true })
  messages?: Message[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}