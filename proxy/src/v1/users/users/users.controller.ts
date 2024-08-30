import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EditUserProfileDto } from './users.dto';
import { UsersService } from './users.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './config/multer.config';

@ApiTags('user')
@Controller('v1/users/')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('edit-profile')
  @UseInterceptors(FileInterceptor('profile_image', multerOptions))
  @ApiResponse({
    status: 200,
    description: 'Edit user profile',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: EditUserProfileDto,
    description: 'Json structure for requesting a ride',
  })
  async editUserProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: EditUserProfileDto,
    @Req() req: Request
  ): Promise<any> {
    const userId = req['user'].sub;

    const payload = {
      userId,
      ...body,
      file,
    };

    await this.usersService.editProfile(payload);

    return 'user details edited successfully';
  }

  @Get('profile-details')
  @ApiResponse({
    status: 200,
    description: 'get profile details of authenticated user',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getUserProfileDetails(@Req() req: Request): Promise<any> {
    const userId = req['user'].sub;

    const res = await this.usersService.getProfileDetails(userId);

    return res;
  }
}
