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

export class GetCurrentLocationEvent {
  constructor(public readonly data: GetCurrentLocationProps) {}
}
