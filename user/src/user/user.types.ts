interface updateLocationOptions {
  address: string;
  currentLatitude: number;
  currentLongitude: number;
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

interface RequestRideProps {
  token: string;
}

interface getNearestDriverProps {
  maxDistance?: number;
  userLatitude: number;
  userLongitude: number;
}
