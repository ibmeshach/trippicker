import { HttpStatus, Injectable } from '@nestjs/common';
import { Client, LatLngLiteral } from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';
import { CustomException } from 'src/custom.exception';

@Injectable()
export class MapsService {
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

  async reverseGeocodeAddress(latlng: LatLngLiteral) {
    const data = await this.googleMapsClient.reverseGeocode({
      params: {
        ...this.getSharedParams(),
        latlng,
      },
    });

    return data.data;
  }

  async getDirections(origin: LatLngLiteral, destination: LatLngLiteral) {
    const data = await this.googleMapsClient.directions({
      params: {
        ...this.getSharedParams(),
        origin,
        destination,
      },
    });

    return data.data;
  }

  async calculateDistance(
    origin: LatLngLiteral[],
    destination: LatLngLiteral[],
  ) {
    const data = await this.googleMapsClient.distancematrix({
      params: {
        ...this.getSharedParams(),
        origins: origin,
        destinations: destination,
      },
    });

    return data.data;
  }

  async getRideDetails(origin: LatLngLiteral, destinations: LatLngLiteral[]) {
    try {
      const data = await this.googleMapsClient.distancematrix({
        params: {
          ...this.getSharedParams(),
          origins: [origin],
          destinations: destinations,
        },
      });

      // Validate the response structure
      const elements = data.data.rows[0]?.elements[0];

      if (!elements || !elements.distance || !elements.duration) {
        throw new CustomException(
          'Invalid lat and lng origin and destination',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(elements, 'data');

      const distanceInMeters = elements.distance.value;
      const distanceInKilometers = distanceInMeters / 1000;
      const durationInMinutes = elements.duration.value / 60;

      // Calculate the cost
      const randomMultiplier = Math.random() * (1.8 - 1.6) + 1.6;
      let costValue = elements.duration.value * randomMultiplier;

      // Round the cost to 2 significant figures
      costValue =
        Math.ceil(costValue / Math.pow(10, Math.floor(Math.log10(costValue)))) *
        Math.pow(10, Math.floor(Math.log10(costValue)));

      // Ensure the minimum price is 1000
      costValue = Math.max(costValue, 1000);

      return {
        distance: {
          value: distanceInKilometers,
          text: elements.distance.text,
          unit: 'km',
        },
        duration: {
          value: durationInMinutes,
          text: elements.duration.text,
          unit: 'minutes',
        },
        cost: {
          value: costValue,
          unit: '₦',
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
