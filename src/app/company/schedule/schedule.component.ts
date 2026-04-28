import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
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
import {
  format,
  addMinutes,
  parse,
  addDays,
  startOfWeek,
  startOfDay,
  isToday,
} from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';

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
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('calendarEl') calendarEl!: ElementRef;
  @ViewChild('mobileDaysScroller') mobileDaysScroller?: ElementRef<HTMLElement>;

  companyId = '';
  companyName = '';
  isLoading = false;
  totalAppointments = 0;
  pendingAppointments = 0;
  confirmedAppointments = 0;
  cancelledAppointments = 0;
  completedAppointments = 0;
  todayAppointments = 0;

  readonly statusItems = [
    { color: '#F59E0B', labelKey: 'COMPANY.CALENDAR.STATUS_PENDING' },
    { color: '#10B981', labelKey: 'COMPANY.CALENDAR.STATUS_CONFIRMED' },
    { color: '#EF4444', labelKey: 'COMPANY.CALENDAR.STATUS_CANCELLED' },
    { color: '#3B82F6', labelKey: 'COMPANY.CALENDAR.STATUS_COMPLETED' },
  ];

  mobileDays: Array<{
    date: string;
    dayShort: string;
    dayNumber: string;
    isToday: boolean;
  }> = [];
  selectedMobileDate = '';
  mobileWeekLabel = '';
  mobileMonthLabel = '';
  selectedMobileDateLabel = '';
  mobileListAnimating = false;
  selectedMobileAppointments: Appointment[] = [];

  private calendar!: Calendar;
  private destroyRef = inject(DestroyRef);
  isMobile = window.innerWidth < 768;
  private calendarInitialized = false;
  private currentFrom = '';
  private currentTo = '';
  private appointmentsCache: Appointment[] = [];
  private mobileListAnimTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.selectedMobileDate = format(new Date(), 'yyyy-MM-dd');
    this.loadCompanyName();
  }

  ngAfterViewInit(): void {
    if (this.isMobile) {
      this.initMobileAgenda();
      return;
    }

    this.initCalendar();
  }

  ngOnDestroy(): void {
    if (this.mobileListAnimTimer) {
      clearTimeout(this.mobileListAnimTimer);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const nowMobile = window.innerWidth < 768;
    if (nowMobile === this.isMobile) {
      return;
    }

    this.isMobile = nowMobile;

    if (nowMobile) {
      if (this.calendarInitialized) {
        this.calendar.destroy();
        this.calendarInitialized = false;
      }
      this.initMobileAgenda();
      this.cdr.markForCheck();
      return;
    }

    this.cdr.detectChanges();
    setTimeout(() => this.initCalendar(), 0);
  }

  private initCalendar(): void {
    if (!this.calendarEl?.nativeElement || this.calendarInitialized) {
      return;
    }

    const lang = this.translate.currentLang || 'pt';

    this.calendar = new Calendar(this.calendarEl.nativeElement, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
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
    this.calendarInitialized = true;
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
          this.appointmentsCache = appointments;
          this.updateSummary(appointments);
          this.updateMobileSelection();

          if (this.calendarInitialized) {
            const events = this.mapToEvents(appointments);
            this.calendar.removeAllEvents();
            if (events.length) {
              this.calendar.addEventSource(events);
            }
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

  private initMobileAgenda(anchorDate: Date = new Date()): void {
    const normalizedAnchor = startOfDay(anchorDate);
    const weekStart = startOfWeek(normalizedAnchor, { weekStartsOn: 1 });
    const rangeStart = addDays(weekStart, -7);
    const rangeEnd = addDays(weekStart, 34);

    this.mobileWeekLabel = `${format(weekStart, 'dd/MM')} - ${format(addDays(weekStart, 6), 'dd/MM')}`;
    this.mobileMonthLabel = this.capitalize(format(normalizedAnchor, 'MMMM yyyy', { locale: this.getDateFnsLocale() }));

    this.mobileDays = Array.from({ length: 42 }).map((_, index) => {
      const date = addDays(rangeStart, index);
      const dateStr = format(date, 'yyyy-MM-dd');

      return {
        date: dateStr,
        dayShort: format(date, 'EEE', { locale: this.getDateFnsLocale() }).replace('.', ''),
        dayNumber: format(date, 'dd'),
        isToday: isToday(date),
      };
    });

    if (!this.mobileDays.some((item) => item.date === this.selectedMobileDate)) {
      this.selectedMobileDate = format(normalizedAnchor, 'yyyy-MM-dd');
    }

    const from = format(rangeStart, 'yyyy-MM-dd');
    const to = format(rangeEnd, 'yyyy-MM-dd');

    if (this.currentFrom === from && this.currentTo === to && this.appointmentsCache.length) {
      this.updateMobileSelection();
      this.scrollSelectedMobileDayIntoView();
      return;
    }

    this.currentFrom = from;
    this.currentTo = to;
    this.loadAppointments(from, to);
    this.scrollSelectedMobileDayIntoView();
  }

  previousMobileWeek(): void {
    const current = parse(`${this.selectedMobileDate} 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date());
    this.initMobileAgenda(addDays(current, -7));
  }

  nextMobileWeek(): void {
    const current = parse(`${this.selectedMobileDate} 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date());
    this.initMobileAgenda(addDays(current, 7));
  }

  selectMobileDate(date: string): void {
    this.selectedMobileDate = date;
    this.updateMobileSelection();
    this.mobileMonthLabel = this.capitalize(
      format(parse(`${date} 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()), 'MMMM yyyy', { locale: this.getDateFnsLocale() }),
    );
    this.scrollSelectedMobileDayIntoView();
    this.cdr.markForCheck();
  }

  goToMobileToday(): void {
    const today = new Date();
    this.selectedMobileDate = format(today, 'yyyy-MM-dd');
    this.initMobileAgenda(today);
  }

  onMobileDatePicked(value: string): void {
    if (!value) {
      return;
    }

    const picked = parse(`${value} 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date());
    this.selectedMobileDate = value;
    this.initMobileAgenda(picked);
  }

  openMobileDatePicker(input: HTMLInputElement): void {
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker();
      return;
    }

    pickerInput.click();
  }

  openMobileAppointment(appointment: Appointment): void {
    const modalRef = this.modal.open(AppointmentDetailComponent, {
      centered: true,
      size: 'md',
    });

    modalRef.componentInstance.appointment = appointment;

    modalRef.result.then(
      (result) => {
        if (result?.action === 'cancel') {
          this.cancelAppointment(result.appointmentId);
        }
      },
      () => {},
    );
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

  private cancelAppointment(appointmentId: string, calendarEvent?: any): void {
    this.schedulingService
      .cancel(appointmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.appointmentsCache = this.appointmentsCache.map((item) =>
            item.id === appointmentId
              ? { ...item, status: SchedulingStatus.Cancelled }
              : item,
          );

          this.updateSummary(this.appointmentsCache);
          this.updateMobileSelection();

          if (calendarEvent) {
            const cancelledColor = this.getStatusColor(SchedulingStatus.Cancelled);
            calendarEvent.setProp('backgroundColor', cancelledColor);
            calendarEvent.setProp('borderColor', cancelledColor);
            calendarEvent.setExtendedProp('appointment', {
              ...calendarEvent.extendedProps['appointment'],
              status: SchedulingStatus.Cancelled,
            });
          }

          this.toastr.success(
            this.translate.instant('COMPANY.CALENDAR.CANCEL_SUCCESS'),
          );
          this.cdr.markForCheck();
        },
      });
  }

  getStatusLabel(status: SchedulingStatus): string {
    switch (status) {
      case SchedulingStatus.Pending:
        return this.translate.instant('COMPANY.CALENDAR.STATUS_PENDING');
      case SchedulingStatus.Confirmed:
        return this.translate.instant('COMPANY.CALENDAR.STATUS_CONFIRMED');
      case SchedulingStatus.Cancelled:
        return this.translate.instant('COMPANY.CALENDAR.STATUS_CANCELLED');
      case SchedulingStatus.Completed:
        return this.translate.instant('COMPANY.CALENDAR.STATUS_COMPLETED');
      default:
        return '-';
    }
  }

  getStatusClass(status: SchedulingStatus): string {
    switch (status) {
      case SchedulingStatus.Pending:
        return 'mobile-status--pending';
      case SchedulingStatus.Confirmed:
        return 'mobile-status--confirmed';
      case SchedulingStatus.Cancelled:
        return 'mobile-status--cancelled';
      case SchedulingStatus.Completed:
        return 'mobile-status--completed';
      default:
        return '';
    }
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

  private getDateFnsLocale() {
    const lang = this.translate.currentLang || 'pt';
    switch (lang) {
      case 'en':
        return enUS;
      case 'es':
        return es;
      default:
        return ptBR;
    }
  }

  private updateSummary(appointments: Appointment[]): void {
    this.totalAppointments = appointments.length;
    this.pendingAppointments = appointments.filter((item) => item.status === SchedulingStatus.Pending).length;
    this.confirmedAppointments = appointments.filter((item) => item.status === SchedulingStatus.Confirmed).length;
    this.cancelledAppointments = appointments.filter((item) => item.status === SchedulingStatus.Cancelled).length;
    this.completedAppointments = appointments.filter((item) => item.status === SchedulingStatus.Completed).length;

    const today = format(new Date(), 'yyyy-MM-dd');
    this.todayAppointments = appointments.filter((item) => item.date === today).length;
  }

  private updateMobileSelection(): void {
    this.selectedMobileAppointments = this.appointmentsCache
      .filter((item) => item.date === this.selectedMobileDate)
      .sort((a, b) => a.time.localeCompare(b.time));

    const selectedDate = parse(
      `${this.selectedMobileDate} 00:00:00`,
      'yyyy-MM-dd HH:mm:ss',
      new Date(),
    );
    this.selectedMobileDateLabel = this.capitalize(
      format(selectedDate, "EEEE, dd 'de' MMMM", { locale: this.getDateFnsLocale() }),
    );
    this.animateMobileList();
  }

  private animateMobileList(): void {
    this.mobileListAnimating = false;
    if (this.mobileListAnimTimer) {
      clearTimeout(this.mobileListAnimTimer);
    }

    this.mobileListAnimTimer = setTimeout(() => {
      this.mobileListAnimating = true;
      this.cdr.markForCheck();

      this.mobileListAnimTimer = setTimeout(() => {
        this.mobileListAnimating = false;
        this.cdr.markForCheck();
      }, 260);
    }, 0);
  }

  private scrollSelectedMobileDayIntoView(): void {
    setTimeout(() => {
      const scroller = this.mobileDaysScroller?.nativeElement;
      if (!scroller) {
        return;
      }

      const selected = scroller.querySelector<HTMLElement>(`[data-date='${this.selectedMobileDate}']`);
      if (!selected) {
        return;
      }

      selected.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 0);
  }

  private capitalize(text: string): string {
    if (!text) {
      return text;
    }

    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
