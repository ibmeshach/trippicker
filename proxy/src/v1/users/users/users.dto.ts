import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditUserProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Omorisiagbon Abraham',
    description: 'user fullname',
  })
  fullname: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'abrahamosazee3@gmail.com',
    description: 'user email',
  })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '08061909748',
    description: 'user phoneNumber',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '',
    description: 'user address',
  })
  address: string;
}
