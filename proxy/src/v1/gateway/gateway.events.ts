export class UpdateUserLocationEvent {
  constructor(public readonly data: UpdateLocationsProps) {}
}

export class GetNearestDriversEvent {
  constructor(public readonly data: GetNearestDriversProps) {}
}

export class UpdateDriverLocationEvent {
  constructor(public readonly data: UpdateLocationsProps) {}
}

export class BookRideEvent {
  constructor(public readonly data: DriverRideResponseFinalProps) {}
}
