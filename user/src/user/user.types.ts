interface LatLng {
  lat: number;
  lng: number;
}

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

interface UserRideResponseProps {
  action: boolean;
  cost: number;
  range: number;
  duration: number;
  origin: LatLng;
  destination: LatLng[];
  user: any;
  driver: any;
  rideId: string;
}

interface SaveChatMessageProps {
  role: string;
  token: string;
  rideId: string;
  content: string;
  userId: string;
}
