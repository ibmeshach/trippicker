interface LatLng {
  lat: number;
  lng: number;
}

interface GeoCodeProps {
  address: string;
}

interface ReverseGeoCodeProps extends LatLng {}

interface DirectionProps {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
}
