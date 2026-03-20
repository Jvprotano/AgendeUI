import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DaySchedule, DAYS_OF_WEEK } from './business-hours';

/**
 * Builds a FormArray of 7 day schedule groups from existing DaySchedule data.
 * Shared between CreateComponent and CompanyEditComponent.
 */
export function buildScheduleFormArray(
  fb: FormBuilder,
  existingSchedule: DaySchedule[],
): FormArray {
  return fb.array(
    DAYS_OF_WEEK.map((day) => {
      const existing = existingSchedule.find((s) => s.dayOfWeek === day.id);
      const isOpen = existing?.isOpen ?? false;
      const intervals =
        existing && isOpen
          ? fb.array(
              existing.intervals.map((interval) =>
                fb.group({
                  start: [interval.start.substring(0, 5), Validators.required],
                  end: [interval.end.substring(0, 5), Validators.required],
                }),
              ),
            )
          : fb.array([] as FormGroup[]);

      return fb.group({
        dayOfWeek: [day.id],
        isOpen: [isOpen],
        intervals,
      });
    }),
  );
}
