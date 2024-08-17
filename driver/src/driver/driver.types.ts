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

interface getNearestDriverProps {
  maxDistance: number;
  userLatitude: number;
  userLongitude: number;
}
