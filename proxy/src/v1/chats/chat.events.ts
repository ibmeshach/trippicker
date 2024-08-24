export class UserSaveChatMessageEvent {
  constructor(public readonly data: UserSaveChatMessageProps) {}
}

export class DriverSaveChatMessageEvent {
  constructor(public readonly data: DriverSaveChatMessageProps) {}
}

export class GetChatsEvent {
  constructor(public readonly data: GetChatsProps) {}
}
