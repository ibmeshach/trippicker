import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { multerOptions } from './config/multer.config';
import { EditDriverProfileDto } from './drivers.dto';
import { DriversService } from './drivers.service';

@Controller('drivers')
@Controller('v1/drivers/')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}
  @Put('edit-profile')
  @UseInterceptors(FileInterceptor('profile_image', multerOptions))
  @ApiResponse({
    status: 200,
    description: 'Edit driver profile',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: EditDriverProfileDto,
    description: 'Json structure for requesting a ride',
  })
  async editDriverProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: EditDriverProfileDto,
    @Req() req: Request
  ): Promise<any> {
    const userId = req['user'].sub;

    const payload = {
      userId,
      ...body,
      file,
    };

    await this.driversService.editProfile(payload);

    return 'user details edited successfully';
  }

  @Get('profile-details')
  @ApiResponse({
    status: 200,
    description: 'get profile details of authenticated driver',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getDriverProfileDetails(@Req() req: Request): Promise<any> {
    const userId = req['user'].sub;

    const res = await this.driversService.getProfileDetails(userId);

    return res;
  }
}
