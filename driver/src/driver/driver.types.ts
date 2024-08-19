interface LatLng {
  lat: number;
  lng: number;
}

interface updateLocationOptions {
  address: string;
  currentLatitude: number;
  currentLongitude: number;
}

interface findDriversOptions {
  isAvailable?: boolean;
  isOnline?: boolean;
}

interface updateUserOptions {
  phoneNumber?: string;
  address?: string;
  currentLatitude?: number;
  currentLongitude?: number;
}

interface LocationEventPayloadProps extends updateLocationOptions {
  token: string;
}

interface DriverProps {}

interface GetNearestDriverProps {
  maxDistance: number;
  userLatitude: number;
  userLongitude: number;
}

interface GetClosestDriverProps {
  userId: string;
  origin: LatLng;
}
