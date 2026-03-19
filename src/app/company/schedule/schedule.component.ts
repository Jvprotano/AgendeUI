import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { SchedulingService } from '../../scheduling/services/scheduling.service';
import { Appointment } from '../../scheduling/models/appointment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-schedule',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgbModalModule,
    SidebarComponent,
  ],
  providers: [SchedulingService],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit, OnDestroy {

  @ViewChild('detailModal') detailModal!: TemplateRef<any>;

  calendarOptions!: CalendarOptions;
  isLoading = true;
  companyId = '';
  selectedAppointment: Appointment | null = null;

  private subscriptions = new Subscription();

  constructor(
    private schedulingService: SchedulingService,
    private route: ActivatedRoute,
    private modal: NgbModal,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.initCalendar();
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initCalendar(): void {
    this.calendarOptions = {
      locales: allLocales,
      locale: 'pt-br',
      timeZone: 'local',
      editable: false,
      droppable: false,
      selectable: false,
      navLinks: true,
      initialView: this.getInitialView(),
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      },
      buttonText: {
        day: 'Dia',
        month: 'Mês',
        today: 'Hoje',
        week: 'Semana',
        list: 'Lista',
      },
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
      dayMaxEventRows: 3,
      eventClick: (info: EventClickArg) => this.onEventClick(info),
      events: [],
    };
  }

  loadAppointments(): void {
    const now = new Date();
    const startDate = this.getWeekStart(now);
    const endDate = this.getWeekEnd(now);

    const sub = this.schedulingService
      .getByCompanyId(this.companyId, startDate, endDate)
      .subscribe({
        next: (appointments) => {
          this.calendarOptions = {
            ...this.calendarOptions,
            events: this.mapToCalendarEvents(appointments),
          };
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });

    this.subscriptions.add(sub);
  }

  mapToCalendarEvents(appointments: Appointment[]): any[] {
    return (appointments ?? []).map((apt) => ({
      id: apt.id,
      title: `${apt.customerName} — ${apt.serviceName}`,
      start: `${apt.date}T${apt.time}`,
      backgroundColor: this.statusColor(apt.status),
      borderColor: this.statusColor(apt.status),
      extendedProps: { appointment: apt },
    }));
  }

  statusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#00C853';
      case 'cancelled': return '#F44336';
      default: return '#FFC107';
    }
  }

  onEventClick(info: EventClickArg): void {
    this.selectedAppointment = info.event.extendedProps['appointment'];
    this.modal.open(this.detailModal, { centered: true, size: 'sm' });
  }

  getInitialView(): string {
    return window.innerWidth <= 768 ? 'listWeek' : 'timeGridWeek';
  }

  getWeekStart(date: Date): string {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }

  getWeekEnd(date: Date): string {
    const d = new Date(date);
    d.setDate(d.getDate() + (6 - d.getDay()));
    return d.toISOString().split('T')[0];
  }

  statusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  }

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}
