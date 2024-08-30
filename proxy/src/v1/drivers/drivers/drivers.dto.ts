import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditDriverProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Omorisiagbon Abraham',
    description: 'driver fullname',
  })
  fullname: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'abrahamosazee3@gmail.com',
    description: 'driver email',
  })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '08061909748',
    description: 'driver phoneNumber',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '',
    description: 'driver address',
  })
  address: string;
}
