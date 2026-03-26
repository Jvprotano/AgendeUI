import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { SchedulingService } from '../../services/scheduling.service';
import { OpeningHours } from '../../../company/models/opening_hours';

export interface DateTimeSelection {
  date: string;
  time: string;
}

interface TimeGroup {
  label: string;
  translationKey: string;
  times: string[];
}

@Component({
  selector: 'app-step-datetime',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './step-datetime.component.html',
  styleUrl: './step-datetime.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepDatetimeComponent implements OnChanges {
  @Input() professionalId: string | null = null;
  @Input() serviceId = '';
  @Input() companyId = '';
  @Input() openingHours: OpeningHours[] = [];
  @Input() selectedDate: string | null = null;
  @Input() selectedTime: string | null = null;
  @Output() dateTimeSelected = new EventEmitter<DateTimeSelection>();

  availableTimes: string[] = [];
  timeGroups: TimeGroup[] = [];
  isLoadingTimes = false;
  calendarDate: Date | null = null;
  minDate = new Date();

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  constructor(private schedulingService: SchedulingService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDate'] && this.selectedDate) {
      this.calendarDate = this.parseDate(this.selectedDate);
    }
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    if (this.openingHours && this.openingHours.length > 0) {
      const dayOfWeek = date.getDay();
      return this.openingHours.some(oh => oh.dayOfWeek === dayOfWeek);
    }
    return true;
  };

  onDateSelected(date: Date | null) {
    if (!date) return;
    this.calendarDate = date;
    const dateStr = this.formatDate(date);
    this.selectedTime = null;
    this.fetchAvailableTimes(dateStr);
  }

  selectTime(time: string) {
    if (!this.calendarDate) return;
    this.selectedTime = time;
    this.dateTimeSelected.emit({
      date: this.formatDate(this.calendarDate),
      time,
    });
  }

  private fetchAvailableTimes(date: string) {
    this.isLoadingTimes = true;
    this.availableTimes = [];
    this.timeGroups = [];
    this.cdr.markForCheck();

    this.schedulingService
      .getAvailableTimes(
        date,
        this.professionalId ?? '',
        this.companyId,
        this.serviceId,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.availableTimes = Array.isArray(result) ? result : [];
          this.timeGroups = this.groupTimes(this.availableTimes);
          this.isLoadingTimes = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.availableTimes = [];
          this.timeGroups = [];
          this.isLoadingTimes = false;
          this.cdr.markForCheck();
        },
      });
  }

  private groupTimes(times: string[]): TimeGroup[] {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    for (const time of times) {
      const hour = parseInt(time.split(':')[0], 10);
      if (hour < 12) morning.push(time);
      else if (hour < 18) afternoon.push(time);
      else evening.push(time);
    }

    const groups: TimeGroup[] = [];
    if (morning.length) groups.push({ label: 'Morning', translationKey: 'SCHEDULING.STEP_DATETIME.MORNING', times: morning });
    if (afternoon.length) groups.push({ label: 'Afternoon', translationKey: 'SCHEDULING.STEP_DATETIME.AFTERNOON', times: afternoon });
    if (evening.length) groups.push({ label: 'Evening', translationKey: 'SCHEDULING.STEP_DATETIME.EVENING', times: evening });
    return groups;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
