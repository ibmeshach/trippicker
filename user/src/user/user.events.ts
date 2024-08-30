export class GetNearestDriversEvent {
  constructor(public readonly data: getNearestDriverProps) {}
}

export class RateUserEvent {
  constructor(
    public readonly data: {
      rating: number;
      phoneNumber: string;
      rideId: string;
    },
  ) {}
}
