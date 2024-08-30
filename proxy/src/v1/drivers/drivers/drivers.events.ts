export class EditProfileEvent {
  constructor(public readonly data: EditDriverProfile) {}
}

export class GetProfileEvent {
  constructor(public readonly data: { userId: string }) {}
}
