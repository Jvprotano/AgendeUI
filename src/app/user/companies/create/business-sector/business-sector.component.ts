import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DAYS_OF_WEEK, DaySchedule, TimeInterval, BusinessHours } from '../../../../company/models/business-hours';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimePickerComponent } from '../../../../shared/components/time-picker/time-picker.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-business-sector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
    TimePickerComponent,
  ],
  templateUrl: './business-sector.component.html',
  styleUrls: ['./business-sector.component.css'],
})
export class BusinessSectorComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;

  daysOfWeek = DAYS_OF_WEEK;
  scheduleError: string | null = null;

  private scheduleSub: Subscription | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const scheduleControl = this.form.get('schedule');
    if (scheduleControl) {
      this.scheduleSub = scheduleControl.valueChanges.subscribe(() => {
        this.onChangeTimeRange();
      });
    }
  }

  ngOnDestroy(): void {
    this.scheduleSub?.unsubscribe();
  }

  getScheduleControls(): FormGroup[] {
    return (this.form.get('schedule') as FormArray).controls as FormGroup[];
  }

  getIntervals(dayIndex: number): FormArray {
    return this.getScheduleControls()[dayIndex].get('intervals') as FormArray;
  }

  addInterval(dayIndex: number): void {
    this.getIntervals(dayIndex).push(
      this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required],
      }),
    );
  }

  removeInterval(dayIndex: number, intervalIndex: number): void {
    this.getIntervals(dayIndex).removeAt(intervalIndex);
  }

  onDayToggle(dayIndex: number, isOpen: boolean): void {
    const intervals = this.getIntervals(dayIndex);
    if (isOpen && intervals.length === 0) {
      this.addInterval(dayIndex);
    } else if (!isOpen) {
      while (intervals.length > 0) {
        intervals.removeAt(0);
      }
    }
  }

  applyToOtherDays(sourceDayIndex: number): void {
    const sourceIntervals = this.getIntervals(sourceDayIndex).value as TimeInterval[];
    const scheduleControls = this.getScheduleControls();

    for (let i = 0; i < scheduleControls.length; i++) {
      if (i === sourceDayIndex) continue;

      const dayGroup = scheduleControls[i];
      dayGroup.get('isOpen')?.setValue(true);

      const intervals = this.getIntervals(i);
      while (intervals.length > 0) {
        intervals.removeAt(0);
      }

      for (const interval of sourceIntervals) {
        intervals.push(
          this.fb.group({
            start: [interval.start, Validators.required],
            end: [interval.end, Validators.required],
          }),
        );
      }
    }
  }

  hasFilledIntervals(dayIndex: number): boolean {
    const intervals = this.getIntervals(dayIndex).value as TimeInterval[];
    return intervals.length > 0 && intervals.some(i => i.start !== '' && i.end !== '');
  }

  onChangeTimeRange(): void {
    const scheduleControl = this.form.get('schedule');
    if (!scheduleControl) return;

    const formValue = scheduleControl.value;
    const businessHours: BusinessHours = {
      schedule: formValue.map((day: DaySchedule, index: number) => ({
        dayOfWeek: this.daysOfWeek[index].id,
        isOpen: day.isOpen,
        intervals: day.intervals || [],
      })),
    };

    if (!this.isValidSchedule(businessHours)) {
      this.scheduleError =
        'Existem intervalos inválidos ou sobrepostos no horário.';
      scheduleControl.setErrors({ invalidSchedule: true });
      return;
    }

    this.scheduleError = null;
    scheduleControl.setErrors(null);
  }

  private isValidSchedule(businessHours: BusinessHours): boolean {
    return businessHours.schedule.every((day, index) => {
      if (!day.isOpen) return true;
      return this.validateIntervals(index);
    });
  }

  private validateIntervals(dayIndex: number): boolean {
    const intervals = this.getIntervals(dayIndex).value as TimeInterval[];
    if (intervals.length === 0) return true;
    if (intervals.every((i) => i.start === '' && i.end === '')) return true;

    const sorted = [...intervals].sort((a, b) =>
      a.start.localeCompare(b.start),
    );

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].end <= sorted[i].start) return false;
      if (i > 0 && sorted[i].start <= sorted[i - 1].end) return false;
    }

    return true;
  }
}
