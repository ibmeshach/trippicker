export class EndTripEvent {
  constructor(public readonly data: EndTripProps) {}
}

export class StartTripEvent {
  constructor(public readonly data: StartTripProps) {}
}
