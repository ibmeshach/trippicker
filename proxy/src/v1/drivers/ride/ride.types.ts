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
}

interface EndTripProps {
  rideId: string;
  userId: string;
  coinMined: number;
}

interface ArrivedTripProps {
  rideId: string;
  userId: string;
}

interface StartTripProps {
  rideId: string;
  userId: string;
}
