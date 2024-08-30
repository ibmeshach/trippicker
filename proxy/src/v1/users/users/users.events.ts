export class EditProfileEvent {
  constructor(public readonly data: EditUserProfile) {}
}

export class GetProfileEvent {
  constructor(public readonly data: { userId: string }) {}
}
