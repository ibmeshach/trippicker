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
      // Get the distance matrix data
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

      // Extract the distance in kilometers from the response
      const distanceInMeters = elements.distance.value;
      const distanceInKilometers = distanceInMeters / 1000;

      // Calculate the duration using the average speed
      // const durationInSeconds = elements.duration.value;
      const durationInMinutes = elements.duration.value / 60;

      // const durationInHours = distanceInKilometers / averageSpeedKmph;
      // const durationInMinutes = durationInHours * 60;

      // Calculate the cost of the ride in Naira
      const baseFare = 1000; // Base fare in Naira (e.g., ₦1000)
      const costPerKm = 200; // Cost per kilometer (e.g., ₦200 per km)
      const costPerMinute = 50; // Cost per minute of travel time (e.g., ₦50 per minute)

      const totalCost =
        baseFare +
        costPerKm * distanceInKilometers +
        costPerMinute * durationInMinutes;

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
          value: totalCost,
          unit: '₦',
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
