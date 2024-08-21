interface LatLng {
  lat: number;
  lng: number;
}

interface UpdateLocationsProps {
  token: string;
  address: string;
  currentLatitude: number;
  currentLongitude: number;
}

interface PartialRideDetailsProps {
  origin: LatLng;
  destination: LatLng[];
  distance: number;
}

interface GetNearestDriversProps {
  maxDistance: number;
  userLatitude: number;
  userLongitude: number;
}

interface RequestRideGatewayProps {
  cost: number;
  range: number;
  duration: number;
  origin: LatLng;
  destination: LatLng[];
  driver: any;
  user: any;
}

interface DriverRideResponseProps {
  action: boolean;
  cost: number;
  range: number;
  duration: number;
  origin: LatLng;
  destination: LatLng[];
  user: any;
  driver: any;
}
