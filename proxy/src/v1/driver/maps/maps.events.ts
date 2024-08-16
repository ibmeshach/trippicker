export class GeocodeUserEvent {
  constructor(public readonly data: GeocodeProps) {}
}

export class ReverseGeocodeUserEvent {
  constructor(public readonly data: ReverseGeocodeProps) {}
}

export class GetDirectionsUserEvent {
  constructor(public readonly data: GetDirectionProps) {}
}
export class CalculateDistanceUserEvent {
  constructor(public readonly data: CalculateDistanceProps) {}
}
