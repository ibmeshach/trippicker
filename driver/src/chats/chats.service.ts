import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepository: Repository<ChatMessage>,
  ) {}

  create(createUserData: Partial<ChatMessage>) {
    const user = this.chatRepository.create(createUserData);
    return user;
  }

  async getAllChatMessages(
    driverId: string,
    rideId: string,
  ): Promise<ChatMessage[]> {
    const chatsMessages = await this.chatRepository.find({
      where: {
        rideKey: rideId,
        driverId,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return chatsMessages;
  }
}
