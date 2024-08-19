interface ClosestDriverProps {
  userId: string;
  origin: LatLng;
}

interface RideRequestProps {
  id: string;
  cost: number;
  range: number;
  duration: number;
  origin: LatLng;
  destination: LatLng[];
}
