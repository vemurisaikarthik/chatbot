import { Resolver, Query, Mutation, Subscription, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';
import { CreateMessageInput } from './dto/create-message.dto';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Message)
  sendMessage(@Args('createMessageInput') createMessageInput: CreateMessageInput) {
    return this.messagesService.create(createMessageInput);
  }

  @Query(() => [Message], { name: 'messages' })
  findByChatId(@Args('chatId') chatId: string) {
    return this.messagesService.findByChatId(chatId);
  }

  @Query(() => [Message], { name: 'messageHistory' })
  getMessageHistory(
    @Args('chatId') chatId: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset: number,
  ) {
    return this.messagesService.findByChatId(chatId, limit, offset);
  }

  @Subscription(() => Message)
  messageAdded(@Args('chatId') chatId: string) {
    return this.redisService.getPubSub().asyncIterator(`messageAdded:${chatId}`);
  }

  @ResolveField(() => User)
  async user(@Parent() message: Message): Promise<User> {
    return this.usersService.findUser(message.userId);
  }
}