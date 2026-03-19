import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, OnDestroy, Renderer2, ViewChildren, QueryList } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BusinessHours, DAYS_OF_WEEK, DaySchedule, TimeInterval } from '../../../../company/models/business-hours';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-business-sector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './business-sector.component.html',
  styleUrls: ['./business-sector.component.css']
})
export class BusinessSectorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() form!: FormGroup;
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<BusinessHours>();

  daysOfWeek = DAYS_OF_WEEK;
  timeOptions: string[] = [];
  private removeDocumentListener: (() => void) | null = null;

  @ViewChildren(MatSelect) private selects!: QueryList<MatSelect>;

  scheduleError: string | null = null;
  constructor(private fb: FormBuilder, private renderer: Renderer2) {
    this.generateTimeOptions();
  }

  ngOnInit(): void {
    if (!this.form.get('schedule')) {
      this.form.addControl('schedule', this.fb.array(this.daysOfWeek.map(day => this.createDaySchedule(day.id))));
    }

}

  ngAfterViewInit(): void {
    // Listen for mousedown on document and close any open MatSelect panels when clicking outside them.
    this.removeDocumentListener = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
      const path = (event as any).composedPath ? (event as any).composedPath() : (event as any).path || [];
      const clickedInsidePanel = path.some((el: any) => {
        try {
          return el && el.classList && (el.classList.contains('mat-mdc-select-panel') || el.classList.contains('mat-select-panel'));
        } catch (e) {
          return false;
        }
      });

      if (!clickedInsidePanel) {
        // Close all open selects; clicking on other inputs or areas should close them.
        this.selects.forEach(s => {
          try { if (s.panelOpen) s.close(); } catch (e) { /* ignore */ }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.removeDocumentListener) {
      this.removeDocumentListener();
      this.removeDocumentListener = null;
    }
  }

  private generateTimeOptions() {
    // Generate time options from 00:00 to 23:30 in 30-minute intervals
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeOptions.push(timeString);
      }
    }
  }

  // private initForm() {
  //   this.form = this.fb.group({
  //     schedule: this.fb.array(this.daysOfWeek.map(day => this.createDaySchedule(day.id)))
  //   });
  // }

  private createDaySchedule(day : number) {
    return this.fb.group({
      dayOfWeek: day,
      isOpen: [false],
      intervals: this.fb.array([])
    });
  }

  private createTimeInterval() {
    return this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required]
    });
  }

  getScheduleControls() {
    return (this.form.get('schedule') as FormArray).controls;
  }

  getIntervals(dayIndex: number) {
    return this.getScheduleControls()[dayIndex].get('intervals') as FormArray;
  }

  addInterval(dayIndex: number) {
    const intervals = this.getIntervals(dayIndex);
    intervals.push(this.createTimeInterval());
  }

  removeInterval(dayIndex: number, intervalIndex: number) {
    const intervals = this.getIntervals(dayIndex);
    intervals.removeAt(intervalIndex);
  }

  onDayToggle(dayIndex: number, isOpen: boolean) {
    const intervals = this.getIntervals(dayIndex);
    if (isOpen && intervals.length === 0) {
      this.addInterval(dayIndex);
    } else if (!isOpen) {
      while (intervals.length !== 0) {
        intervals.removeAt(0);
      }
    }
  }

  validateIntervals(dayIndex: number): boolean {
    const intervals = this.getIntervals(dayIndex).value as TimeInterval[];
    if (intervals.length === 0) return true;
    if (intervals.every(interval => interval.start == '' && interval.end == '')) return true;

    // Sort intervals by start time
    intervals.sort((a, b) => a.start.localeCompare(b.start));

    // Check for overlaps and valid time ranges
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      if (interval.end <= interval.start) return false;
      
      if (i > 0) {
        const prevInterval = intervals[i - 1];
        if (interval.start <= prevInterval.end) return false;
      }
    }

    return true;
  }

  onChangeTimeRange() {
    const scheduleControl = this.form.get('schedule');
    if (scheduleControl) {
      const formValue = scheduleControl.value;

      const businessHours: BusinessHours = {
        schedule: formValue.map((day: DaySchedule, index: number) => ({
          dayOfWeek: this.daysOfWeek[index].id,
          isOpen: day.isOpen,
          intervals: day.intervals || []
        }))
      };

      if (!this.isValidSchedule(businessHours)) {
        this.scheduleError = 'Schedule contains invalid or overlapping time intervals.';
        scheduleControl.setErrors({ invalidSchedule: true });
        return;
      }

      this.scheduleError = null;
    }
  }

  isValidSchedule(businessHours: BusinessHours): boolean {
    return businessHours.schedule.every((day, index) => {
      if (!day.isOpen) return true;
      return this.validateIntervals(index);
    });
  }

  onPrevious() {
    this.previous.emit();
  }
}
