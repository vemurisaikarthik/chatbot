import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { Chat } from './chat.entity';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    forwardRef(() => MessagesModule),
    UsersModule,
  ],
  providers: [ChatsResolver, ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}