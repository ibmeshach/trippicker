export class UpdateLocationEvent {
  constructor(public readonly data: UpdateLocationsProps) {}
}

export class BookRideEvent {
  constructor(public readonly data: DriverRideResponseProps) {}
}
