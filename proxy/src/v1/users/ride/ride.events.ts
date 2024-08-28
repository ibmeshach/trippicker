export class ClosestDriverEvent {
  constructor(public readonly data: ClosestDriverProps) {}
}

export class CancelRideEvent {
  constructor(public readonly data: CancelRideProps) {}
}

export class GetRidesEvent {
  constructor(public readonly data: GetRidesProps) {}
}

export class GetRideEvent {
  constructor(public readonly data: GetRideProps) {}
}
