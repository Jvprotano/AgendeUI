import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-custom-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-calendar.component.html',
  styleUrl: './custom-calendar.component.css'
})
export class CustomCalendarComponent implements OnInit {
  @Input() events: CalendarEvent[] = [];
  @Input() locale: string = 'pt-BR';
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() eventClicked = new EventEmitter<CalendarEvent>();

  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays: string[] = [];
  monthYear: string = '';

  // Mobile carousel properties
  upcomingDays: CalendarDay[] = [];
  selectedDayIndex: number = 0;
  isMobile: boolean = false;

  private monthNames: Record<string, string[]> = {
    'pt-BR': ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    'en-US': ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'],
    'es-ES': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  };

  private dayNames: Record<string, string[]> = {
    'pt-BR': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'es-ES': ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab']
  };

  ngOnInit(): void {
    this.initializeWeekDays();
    this.generateCalendar();
    this.checkIfMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkIfMobile());
    }
  }

  ngOnChanges(): void {
    this.generateCalendar();
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.generateUpcomingDays();
    }
  }

  private generateUpcomingDays(): void {
    this.upcomingDays = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      this.upcomingDays.push(this.createCalendarDay(date, true));
    }

    // Set today as selected
    this.selectedDayIndex = 0;
  }

  selectDay(index: number): void {
    this.selectedDayIndex = index;
    this.dateSelected.emit(this.upcomingDays[index].date);
  }

  private initializeWeekDays(): void {
    this.weekDays = this.dayNames[this.locale] || this.dayNames['pt-BR'];
  }

  private generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Update month/year display
    const monthNames = this.monthNames[this.locale] || this.monthNames['pt-BR'];
    this.monthYear = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    this.calendarDays = [];

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }

    // Add next month's days
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const dayEvents = this.events.filter(event => 
      event.start.toDateString() === date.toDateString()
    );

    return {
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday,
      events: dayEvents
    };
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  onDateClick(day: CalendarDay): void {
    this.dateSelected.emit(day.date);
  }

  onEventClick(event: CalendarEvent, $event: Event): void {
    $event.stopPropagation();
    this.eventClicked.emit(event);
  }

  getEventColor(color?: string): string {
    const colorMap: Record<string, string> = {
      'yellow': '#ffc107',
      'blue': '#0d6efd',
      'red': '#dc3545',
      'green': '#198754',
      'purple': '#6f42c1'
    };
    return colorMap[color || 'blue'] || '#0d6efd';
  }
}

