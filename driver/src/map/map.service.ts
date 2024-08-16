import { Injectable } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MapService {
  private googleMapsClient: Client;
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.googleMapsClient = new Client({});
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }
  private getSharedParams() {
    return { key: this.apiKey };
  }

  async geocodeAddress(address: string) {
    return this.googleMapsClient.geocode({
      params: {
        ...this.getSharedParams(),
        address,
      },
    });
  }

  async reservegeocodeAddress(latlng: LatLng) {
    return this.googleMapsClient.reverseGeocode({
      params: {
        ...this.getSharedParams(),
        latlng,
      },
    });
  }

  async getDirections(origin: LatLng, destination: LatLng) {
    return this.googleMapsClient.directions({
      params: {
        ...this.getSharedParams(),
        origin,
        destination,
      },
    });
  }
}
