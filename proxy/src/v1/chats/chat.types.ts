interface DriverSaveChatMessageProps {
  driverId: string;
  role: string;
  rideId: string;
  content: string;
}

interface UserSaveChatMessageProps {
  userId: string;
  role: string;
  rideId: string;
  content: string;
}

interface GetChatsProps {
  id: string;
  rideId: string;
}
