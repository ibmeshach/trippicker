interface RideStausProps {
  driverId: string;
  rideId: string;
}

interface RideEndTripProps extends RideStausProps {
  coinMined: number;
}

interface EndTripProps {
  phoneNumber: string;
  rideId: string;
  coinMined: number;
}

interface StartTripProps {
  phoneNumber: string;
  rideId: string;
}

interface CancelRideProps {
  phoneNumber: string;
  rideId: string;
}
