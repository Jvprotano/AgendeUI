import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';
import { Calendar, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import esLocale from '@fullcalendar/core/locales/es';
import { format, addMinutes, parse } from 'date-fns';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { SchedulingService } from '../../scheduling/services/scheduling.service';
import { CompanyService } from '../services/company.service';
import { Appointment, SchedulingStatus } from '../../scheduling/models/appointment';
import { AppointmentDetailComponent } from './appointment-detail/appointment-detail.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SidebarComponent,
    TranslateModule,
    MatProgressBarModule,
  ],
  providers: [SchedulingService, CompanyService],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  @ViewChild('calendarEl') calendarEl!: ElementRef;

  companyId = '';
  companyName = '';
  isLoading = false;

  readonly statusItems = [
    { color: '#F59E0B', labelKey: 'COMPANY.CALENDAR.STATUS_PENDING' },
    { color: '#10B981', labelKey: 'COMPANY.CALENDAR.STATUS_CONFIRMED' },
    { color: '#EF4444', labelKey: 'COMPANY.CALENDAR.STATUS_CANCELLED' },
    { color: '#3B82F6', labelKey: 'COMPANY.CALENDAR.STATUS_COMPLETED' },
  ];

  private calendar!: Calendar;
  private destroyRef = inject(DestroyRef);
  private isMobile = window.innerWidth < 768;
  private currentFrom = '';
  private currentTo = '';

  constructor(
    private schedulingService: SchedulingService,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private modal: NgbModal,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.loadCompanyName();
  }

  ngAfterViewInit(): void {
    this.initCalendar();
  }

  @HostListener('window:resize')
  onResize(): void {
    const nowMobile = window.innerWidth < 768;
    if (nowMobile !== this.isMobile && this.calendar) {
      this.isMobile = nowMobile;
      this.calendar.changeView(nowMobile ? 'listWeek' : 'timeGridWeek');
    }
  }

  private initCalendar(): void {
    const lang = this.translate.currentLang || 'pt';

    this.calendar = new Calendar(this.calendarEl.nativeElement, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: this.isMobile ? 'listWeek' : 'timeGridWeek',
      locale: this.getCalendarLocale(lang),
      firstDay: 1,
      editable: false,
      selectable: false,
      navLinks: true,
      nowIndicator: true,
      dayMaxEventRows: 3,
      slotDuration: '00:30:00',
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00',
      allDaySlot: false,
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '18:00',
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      height: 'auto',
      datesSet: (info) => this.onDatesSet(info),
      eventClick: (info) => this.onEventClick(info),
    });

    this.calendar.render();
  }

  private onDatesSet(info: { start: Date; end: Date }): void {
    const from = format(info.start, 'yyyy-MM-dd');
    const to = format(info.end, 'yyyy-MM-dd');

    if (from === this.currentFrom && to === this.currentTo) return;

    this.currentFrom = from;
    this.currentTo = to;
    this.loadAppointments(from, to);
  }

  private loadAppointments(from: string, to: string): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.schedulingService
      .getByCompany(this.companyId, from, to, 1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          const appointments = result?.items ?? [];
          const events = this.mapToEvents(appointments);
          this.calendar.removeAllEvents();
          if (events.length) {
            this.calendar.addEventSource(events);
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadCompanyName(): void {
    this.companyService
      .getById(this.companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (company) => {
          this.companyName = company?.name || '';
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  private mapToEvents(appointments: Appointment[]): EventInput[] {
    return (appointments ?? []).map((apt) => {
      const startStr = `${apt.date}T${apt.time}`;
      const startDate = parse(`${apt.date} ${apt.time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
      const endDate = addMinutes(startDate, 30);
      const color = this.getStatusColor(apt.status);

      return {
        id: apt.id,
        title: apt.customerName || 'Cliente',
        start: startStr,
        end: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        backgroundColor: color,
        borderColor: color,
        textColor: '#ffffff',
        extendedProps: { appointment: apt },
      };
    });
  }

  private onEventClick(info: { event: any }): void {
    const appointment: Appointment = info.event.extendedProps['appointment'];

    const modalRef = this.modal.open(AppointmentDetailComponent, {
      centered: true,
      size: 'md',
    });

    modalRef.componentInstance.appointment = appointment;

    modalRef.result.then(
      (result) => {
        if (result?.action === 'cancel') {
          this.cancelAppointment(result.appointmentId, info.event);
        }
      },
      () => {},
    );
  }

  private cancelAppointment(appointmentId: string, calendarEvent: any): void {
    this.schedulingService
      .cancel(appointmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const cancelledColor = this.getStatusColor(SchedulingStatus.Cancelled);
          calendarEvent.setProp('backgroundColor', cancelledColor);
          calendarEvent.setProp('borderColor', cancelledColor);
          calendarEvent.setExtendedProp('appointment', {
            ...calendarEvent.extendedProps['appointment'],
            status: SchedulingStatus.Cancelled,
          });
          this.toastr.success(
            this.translate.instant('COMPANY.CALENDAR.CANCEL_SUCCESS'),
          );
        },
      });
  }

  private getStatusColor(status: SchedulingStatus): string {
    switch (status) {
      case SchedulingStatus.Pending: return '#F59E0B';
      case SchedulingStatus.Confirmed: return '#10B981';
      case SchedulingStatus.Cancelled: return '#EF4444';
      case SchedulingStatus.Completed: return '#3B82F6';
      default: return '#6B7280';
    }
  }

  private getCalendarLocale(lang: string): any {
    switch (lang) {
      case 'es': return esLocale;
      case 'en': return undefined;
      default: return ptBrLocale;
    }
  }
}
