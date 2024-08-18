interface LatLng {
  lat: number;
  lng: number;
}

interface GeocodeProps {
  address: string;
}

interface ReverseGeocodeProps extends LatLng {}

interface GetDirectionProps {
  origin: LatLng;
  destination: LatLng;
}

interface CalculateDistanceProps {
  origin: LatLng[];
  destination: LatLng[];
}
