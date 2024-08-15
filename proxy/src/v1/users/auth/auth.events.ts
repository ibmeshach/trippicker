export class LoginUserEvent {
  constructor(public readonly data: LoginProps) {}
}

export class SignupUserEvent {
  constructor(public readonly data: SignupProps) {}
}

export class VerifyOtpEvent {
  constructor(public readonly data: VerifyOtpCodeProps) {}
}

export class ResendOtpEvent {
  constructor(public readonly data: ResendOtpCodeProps) {}
}
