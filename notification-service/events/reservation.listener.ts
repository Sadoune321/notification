import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReservationListener {
  private readonly logger = new Logger(ReservationListener.name);

 
  private readonly notifiedReservations = new Set<string>();

  constructor(
    private readonly httpService: HttpService,
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkUpcomingMeetings() {
    const reservationUrl = this.config.get<string>('RESERVATION_SERVICE_URL');

    this.logger.debug('Vérification des meetings à venir...');

    try {
     

      let upcomingReservations: any[] = [];

      try {
        const response = await firstValueFrom(
          this.httpService.get(`${reservationUrl}/reservation/upcoming/all`),
        );
        upcomingReservations = response.data ?? [];
      } catch (err: any) {
        
        if (err?.response?.status === 404 || err?.response?.status === 405) {
          this.logger.warn(
            '/reservation/upcoming/all non disponible, endpoint ignoré.',
          );
          return;
        }
        throw err;
      }

      if (!upcomingReservations.length) {
        this.logger.debug('Aucun meeting imminent.');
        return;
      }

     
      for (const reservation of upcomingReservations) {
        const reservationId: string = reservation.id;

        if (this.notifiedReservations.has(reservationId)) {
          continue; 
        }

        const {
          patientId,
          doctorId,
          meetingUrl,
          schedule,
        } = reservation;

        const day: string = schedule?.dayOfWeek ?? '';
        const startTime: string = schedule?.startTime ?? '';

       
        await this.notificationService.notifyMeetingReminder({
          reservationId,
          userId: patientId,
          meetingUrl,
          minutesBefore: 15,
          day,
          startTime,
        });

       
        await this.notificationService.notifyMeetingReminder({
          reservationId,
          userId: doctorId,
          meetingUrl,
          minutesBefore: 15,
          day,
          startTime,
        });

        this.notifiedReservations.add(reservationId);
        this.logger.log(
          `Rappel envoyé pour la réservation ${reservationId} (doctor: ${doctorId}, patient: ${patientId})`,
        );
      }

      this.logger.debug('Reminder check done');
    } catch (err) {
      this.logger.error('Erreur reminder check', err);
    }
  }
}
