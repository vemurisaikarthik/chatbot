import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { CreateChatInput } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
  ) {}

  async create(createChatInput: CreateChatInput): Promise<Chat> {
    const chat = this.chatsRepository.create(createChatInput);
    return await this.chatsRepository.save(chat);
  }

  async findAll(): Promise<Chat[]> {
    return this.chatsRepository.find({
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }

    return chat;
  }

  async findByParticipant(userId: string): Promise<Chat[]> {
    return this.chatsRepository
      .createQueryBuilder('chat')
      .where(':userId = ANY(chat.participants)', { userId })
      .leftJoinAndSelect('chat.messages', 'messages')
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();
  }

  async joinChat(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.findOne(chatId);

    if (!chat.participants.includes(userId)) {
      chat.participants.push(userId);
      await this.chatsRepository.save(chat);
    }

    return chat;
  }
}