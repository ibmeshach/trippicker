import { Injectable } from '@nestjs/common';
import { Client, LatLngLiteral } from '@googlemaps/google-maps-services-js';
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
    const data = await this.googleMapsClient.geocode({
      params: {
        ...this.getSharedParams(),
        address,
      },
    });

    return data.data;
  }

  async reservegeocodeAddress(latlng: LatLng) {
    const data = await this.googleMapsClient.reverseGeocode({
      params: {
        ...this.getSharedParams(),
        latlng,
      },
    });

    return data.data;
  }

  async getDirections(origin: LatLng, destination: LatLng) {
    const data = await this.googleMapsClient.directions({
      params: {
        ...this.getSharedParams(),
        origin,
        destination,
      },
    });

    return data.data;
  }

  async calculateDistance(origin: LatLng[], destination: LatLng[]) {
    const data = await this.googleMapsClient.distancematrix({
      params: {
        ...this.getSharedParams(),
        origins: origin,
        destinations: destination,
      },
    });

    return data.data;
  }
}
