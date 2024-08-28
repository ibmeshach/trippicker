export class ClosestDriverEvent {
  constructor(public readonly data: ClosestDriverProps) {}
}

export class EndTripEvent {
  constructor(public readonly data: EndTripProps) {}
}

export class ArrivedTripEvent {
  constructor(public readonly data: ArrivedTripProps) {}
}

export class StartTripEvent {
  constructor(public readonly data: StartTripProps) {}
}

export class GetRidesEvent {
  constructor(public readonly data: GetRidesProps) {}
}

export class GetRideEvent {
  constructor(public readonly data: GetRideProps) {}
}
