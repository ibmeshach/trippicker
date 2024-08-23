import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { ChatsController } from './chats.controller';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, User]),
    ClientsModule.register([
      {
        name: 'DRIVERS',
        transport: Transport.TCP,
        options: {
          // host: 'users-nestjs-backend.railway.internal',
          port: 3002,
        },
      },
    ]),
  ],
  providers: [ChatsService, UserService],
  controllers: [ChatsController],
})
export class ChatsModule {}
