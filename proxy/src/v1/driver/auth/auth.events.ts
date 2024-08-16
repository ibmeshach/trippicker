export class LoginUserEvent {
  constructor(public readonly data: LoginProps) {}
}

export class VerifyOtpEvent {
  constructor(public readonly data: VerifyOtpCodeProps) {}
}

export class ResendOtpEvent {
  constructor(public readonly data: ResendOtpCodeProps) {}
}
