import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsPositive,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LatLng {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 6.5244,
    description: 'Latitude of the location',
  })
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 3.3792,
    description: 'Longitude of the location',
  })
  lng: number;
}

export class RequestRideDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1500,
    description: 'Estimated cost of the ride',
  })
  cost: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 12.5,
    description: 'Estimated range/distance of the ride in kilometers',
  })
  range: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 30,
    description: 'Estimated duration of the ride in minutes',
  })
  duration: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LatLng)
  @ApiProperty({
    type: LatLng,
    description: 'Starting point of the ride (latitude and longitude)',
  })
  origin: LatLng;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => LatLng)
  @ApiProperty({
    type: [LatLng],
    description: 'Destination points of the ride (latitude and longitude)',
  })
  destination: LatLng[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'unibern',
    description: 'origin address',
  })
  originAddress: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Destination addresses',
  })
  destinationAddresses: string[];
}

export class CancelRideDto {
  @ApiProperty({
    example:
      'MTcyNDQyMjU3MTgxOC0wOWFiZGJlOC0yMTkxLTRmODItOTI5Ny05M2Y3MmJjNTI5ZTI=',
    description: 'rideId of the ride',
  })
  @IsNotEmpty()
  @IsString()
  rideId: string;
}
