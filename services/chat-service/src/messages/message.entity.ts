import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Chat } from '../chats/chat.entity';

@Entity('messages')
@ObjectType()
@Index(['chatId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  content: string;

  @Column('uuid')
  @Field()
  userId: string;

  @Column('uuid')
  @Field()
  chatId: string;

  @ManyToOne(() => Chat, chat => chat.messages)
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}