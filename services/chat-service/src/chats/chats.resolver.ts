import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { ChatsService } from './chats.service';
import { Chat } from './chat.entity';
import { CreateChatInput } from './dto/create-chat.dto';
import { Message } from '../messages/message.entity';
import { MessagesService } from '../messages/messages.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Chat)
  createChat(@Args('createChatInput') createChatInput: CreateChatInput) {
    return this.chatsService.create(createChatInput);
  }

  @Query(() => [Chat], { name: 'chats' })
  findAll() {
    return this.chatsService.findAll();
  }

  @Query(() => Chat, { name: 'chat' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.chatsService.findOne(id);
  }

  @Query(() => [Chat], { name: 'chatsByUser' })
  findByUser(@Args('userId') userId: string) {
    return this.chatsService.findByParticipant(userId);
  }

  @Mutation(() => Chat)
  joinChat(
    @Args('chatId') chatId: string,
    @Args('userId') userId: string,
  ) {
    return this.chatsService.joinChat(chatId, userId);
  }

  @ResolveField(() => [Message])
  async messages(@Parent() chat: Chat): Promise<Message[]> {
    if (chat.messages) {
      return chat.messages;
    }
    return this.messagesService.findByChatId(chat.id);
  }

  @ResolveField(() => [User])
  async participantUsers(@Parent() chat: Chat): Promise<User[]> {
    return this.usersService.findUsers(chat.participants);
  }
}