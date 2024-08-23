import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetChatsDto {
  @ApiProperty({
    example:
      'MTcyNDQyMjU3MTgxOC0wOWFiZGJlOC0yMTkxLTRmODItOTI5Ny05M2Y3MmJjNTI5ZTI=',
    description: 'rideId of the ride',
  })
  @IsNotEmpty()
  @IsString()
  rideId: string;
}
