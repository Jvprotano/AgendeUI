import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChildren, QueryList } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DAYS_OF_WEEK, DaySchedule, TimeInterval, BusinessHours } from '../../../../company/models/business-hours';
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
    MatTooltipModule,
  ],
  templateUrl: './business-sector.component.html',
  styleUrls: ['./business-sector.component.css'],
})
export class BusinessSectorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() form!: FormGroup;

  daysOfWeek = DAYS_OF_WEEK;
  timeOptions: string[] = [];
  scheduleError: string | null = null;

  @ViewChildren(MatSelect) private selects!: QueryList<MatSelect>;
  private removeDocumentListener: (() => void) | null = null;

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
  ) {
    this.generateTimeOptions();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.removeDocumentListener = this.renderer.listen(
      'document',
      'mousedown',
      (event: MouseEvent) => {
        const path =
          (event as any).composedPath?.() || (event as any).path || [];
        const clickedInsidePanel = path.some((el: any) => {
          try {
            return (
              el?.classList?.contains('mat-mdc-select-panel') ||
              el?.classList?.contains('mat-select-panel')
            );
          } catch {
            return false;
          }
        });

        if (!clickedInsidePanel) {
          this.selects.forEach((s) => {
            try {
              if (s.panelOpen) s.close();
            } catch {}
          });
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.removeDocumentListener) {
      this.removeDocumentListener();
      this.removeDocumentListener = null;
    }
  }

  private generateTimeOptions(): void {
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        this.timeOptions.push(
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        );
      }
    }
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
