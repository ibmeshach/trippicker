interface ClosestDriverProps {
  userId: string;
  origin: LatLng;
  driverId: string;
}

interface RideRequestProps {
  id: string;
  driverId: string;
  cost: number;
  range: number;
  duration: number;
  origin: LatLng;
  destination: LatLng[];
  originAddress: string;
  destinationAddresses: string[];
}

interface CancelRideProps {
  userId: string;
  rideId: string;
}

interface GetRidesProps {
  userId: string;
}

interface GetRideProps {
  userId: string;
  rideId: string;
}
