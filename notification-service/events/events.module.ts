import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ReservationListener } from './reservation.listener';
import { StorageListener } from './storage.listener';
import { StorageController } from './storage.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    NotificationModule,
   
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [StorageController],
  providers: [ReservationListener, StorageListener],
})
export class EventsModule {}
