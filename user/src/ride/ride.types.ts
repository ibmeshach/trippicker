interface RideStausProps {
  phoneNumber: string;
  rideId: string;
}

interface RideEndTripProps {
  phoneNumber: string;
  rideId: string;
  coinMined: number;
}

interface RideStartTripProps {
  phoneNumber: string;
  rideId: string;
}

interface RideArrivedTripProps {
  phoneNumber: string;
  rideId: string;
}

interface CancelRideProps {
  phoneNumber: string;
  rideId: string;
}
