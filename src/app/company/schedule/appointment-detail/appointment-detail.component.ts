import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { format, parse } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';

import {
  Appointment,
  normalizeSchedulingStatus,
  SchedulingStatus,
} from '../../../scheduling/models/appointment';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.scss',
})
export class AppointmentDetailComponent {
  appointment!: Appointment;
  showConfirmCancel = false;

  private readonly statusKeyMap: Record<number, string> = {
    [SchedulingStatus.Pending]: 'COMPANY.CALENDAR.STATUS_PENDING',
    [SchedulingStatus.Confirmed]: 'COMPANY.CALENDAR.STATUS_CONFIRMED',
    [SchedulingStatus.Cancelled]: 'COMPANY.CALENDAR.STATUS_CANCELLED',
    [SchedulingStatus.Completed]: 'COMPANY.CALENDAR.STATUS_COMPLETED',
  };

  constructor(
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
  ) {}

  get canCancel(): boolean {
    return (
      normalizeSchedulingStatus(this.appointment.status) === SchedulingStatus.Pending ||
      normalizeSchedulingStatus(this.appointment.status) === SchedulingStatus.Confirmed
    );
  }

  get statusColor(): string {
    switch (normalizeSchedulingStatus(this.appointment.status)) {
      case SchedulingStatus.Pending: return '#F59E0B';
      case SchedulingStatus.Confirmed: return '#10B981';
      case SchedulingStatus.Cancelled: return '#EF4444';
      case SchedulingStatus.Completed: return '#3B82F6';
      default: return '#6B7280';
    }
  }

  get statusKey(): string {
    return this.statusKeyMap[normalizeSchedulingStatus(this.appointment.status)] || 'COMPANY.CALENDAR.STATUS_PENDING';
  }

  get formattedDate(): string {
    const date = parse(this.appointment.date, 'yyyy-MM-dd', new Date());
    const lang = this.translate.currentLang || 'pt';
    const locale = this.getDateLocale(lang);

    if (lang === 'en') {
      return format(date, 'EEEE, MMMM d, yyyy', { locale });
    }
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale });
  }

  get formattedTime(): string {
    const parts = this.appointment.time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  onCancelClick(): void {
    this.showConfirmCancel = true;
  }

  onConfirmCancel(): void {
    this.activeModal.close({ action: 'cancel', appointmentId: this.appointment.id });
  }

  onDismissCancel(): void {
    this.showConfirmCancel = false;
  }

  private getDateLocale(lang: string) {
    switch (lang) {
      case 'es': return es;
      case 'en': return enUS;
      default: return ptBR;
    }
  }
}
