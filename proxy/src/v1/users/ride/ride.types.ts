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
