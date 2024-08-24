import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { GetChatsEvent } from './chat.events';

@Injectable()
export class ChatService {
  constructor(
    @Inject('DRIVERS') private readonly driversClient: ClientProxy,
    @Inject('USERS') private readonly usersClient: ClientProxy,
  ) {}

  async getDriverChats(body: GetChatsProps) {
    const observableData = this.driversClient
      .send('driver.getAllChatMessages', new GetChatsEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const chats = await firstValueFrom(observableData);

    return chats;
  }

  async getUserChats(body: GetChatsProps) {
    const observableData = this.usersClient
      .send('user.getAllChatMessages', new GetChatsEvent(body))
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );

    const chats = await firstValueFrom(observableData);

    return chats;
  }
}
