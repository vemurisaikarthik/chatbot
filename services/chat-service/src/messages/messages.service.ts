import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageInput } from './dto/create-message.dto';
import { RedisService } from '../redis/redis.service';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private redisService: RedisService,
    private chatsService: ChatsService,
  ) {}

  async create(createMessageInput: CreateMessageInput): Promise<Message> {
    const message = this.messagesRepository.create(createMessageInput);
    const savedMessage = await this.messagesRepository.save(message);

    await this.chatsService.findOne(createMessageInput.chatId);

    this.redisService.getPubSub().publish(`messageAdded:${createMessageInput.chatId}`, {
      messageAdded: savedMessage,
    });

    return savedMessage;
  }

  async findByChatId(chatId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  async getMessageHistory(chatId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });
  }
}