interface LatLng {
  lat: number;
  lng: number;
}

interface GeoCodeProps {
  address: string;
}

interface ReverseGeoCodeProps extends LatLng {}

interface DirectionProps {
  origin: LatLng;
  destination: LatLng;
}

interface calculateDistanceProps {
  origins: LatLng[];
  distinations: LatLng[];
}
