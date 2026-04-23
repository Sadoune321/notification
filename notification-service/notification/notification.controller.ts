import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import type { Request } from 'express';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

 
  @Get('me')
  getMyNotifications(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.notificationService.findByUser(userId);
  }

 
  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

 
  @Patch('me/read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllAsRead(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.notificationService.markAllAsRead(userId);
  }

  
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  
  @Post('reservation-created')
  @HttpCode(HttpStatus.CREATED)
  onReservationCreated(@Body() data: any) {
    return this.notificationService.notifyReservationCreated(data);
  }

  
  @Post('reservation-cancelled')
  @HttpCode(HttpStatus.CREATED)
  onReservationCancelled(@Body() data: any) {
    return this.notificationService.notifyReservationCancelled(data);
  }
}
