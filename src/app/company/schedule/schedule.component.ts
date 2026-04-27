import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CustomCalendarComponent } from './custom-calendar/custom-calendar.component';
import { EventOffcanvasComponent } from './event-offcanvas/event-offcanvas.component';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgbModalModule,
    SidebarComponent,
    CustomCalendarComponent,
    EventOffcanvasComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit, AfterViewInit {

  @ViewChild('dayViewModal') dayViewModal: any;
  @ViewChild('eventDetailModal') eventDetailModal: any;
  @ViewChild('createEventModal') createEventModal: any;

  events: CalendarEvent[] = [
    {
      id: '1',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
      title: 'Agendamento',
      color: 'yellow',
      description: 'Agendamento de exemplo'
    }
  ];
  selectedDay: Date | null = null;
  selectedEvent: CalendarEvent | null = null;
  subscriptions: Subscription = new Subscription();
  eventForm!: FormGroup;
  locale: string = 'pt-BR';

  // Offcanvas properties
  offcanvasOpen: boolean = false;
  offcanvasMode: 'view' | 'create' | 'edit' = 'create';
  isMobile: boolean = false;

  constructor(private modal: NgbModal, private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    this.loadSchedules();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  loadSchedules(): void {
    this.http.get<any>('http://localhost:5133/api/v1/schedules').subscribe({
      next: (response) => {
        if (response && response.data) {
          this.events = response.data.map((event: any) => ({
            id: event.id || Math.random().toString(),
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end),
            color: event.color || 'blue',
            description: event.description || ''
          }));
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.log('Using default events');
      }
    });
  }

  onDateSelected(date: Date): void {
    this.selectedDay = date;
    this.selectedEvent = null;

    if (this.isMobile) {
      this.offcanvasMode = 'create';
      this.offcanvasOpen = true;
    } else {
      this.openDayViewModal();
    }
    this.cdr.markForCheck();
  }

  getEventsForDay(date: Date | null): CalendarEvent[] {
    if (!date) return [];
    return this.events.filter(event =>
      event.start.toDateString() === date.toDateString()
    );
  }

  onEventClicked(event: CalendarEvent): void {
    this.selectedEvent = event;

    if (this.isMobile) {
      this.offcanvasMode = 'view';
      this.offcanvasOpen = true;
    } else {
      this.openEventDetailModal();
    }
    this.cdr.markForCheck();
  }

  openDayViewModal(): void {
    if (this.dayViewModal) {
      this.modal.open(this.dayViewModal, { size: 'lg', centered: true });
    }
  }

  openEventDetailModal(): void {
    if (this.eventDetailModal) {
      this.modal.open(this.eventDetailModal, { size: 'lg', centered: true });
    }
  }

  openCreateEventModal(): void {
    if (this.createEventModal) {
      this.modal.open(this.createEventModal, { size: 'lg', centered: true });
    }
  }

  closeOffcanvas(): void {
    this.offcanvasOpen = false;
    this.cdr.markForCheck();
  }

  onOffcanvasEdit(): void {
    this.offcanvasMode = 'edit';
    this.cdr.markForCheck();
  }

  onOffcanvasSave(event: CalendarEvent): void {
    // Implementar lógica de salvamento
    console.log('Salvando evento:', event);
    this.events.push(event);
    this.closeOffcanvas();
    this.cdr.markForCheck();
  }

  onOffcanvasDelete(event: CalendarEvent): void {
    // Implementar lógica de exclusão
    console.log('Deletando evento:', event);
    this.events = this.events.filter(e => e.id !== event.id);
    this.closeOffcanvas();
    this.cdr.markForCheck();
  }

  editEvent(): void {
    // Implementar lógica de edição
    console.log('Editando evento:', this.selectedEvent);
  }

  deleteEvent(): void {
    // Implementar lógica de exclusão
    console.log('Deletando evento:', this.selectedEvent);
  }

  saveEvent(): void {
    // Implementar lógica de salvamento
    console.log('Salvando evento');
  }

  getUpcomingEvents(): CalendarEvent[] {
    return this.events
      .filter(event => new Date(event.start) > new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }

}
