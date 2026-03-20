import { OpeningHours } from './opening_hours';
import { DaySchedule, DAYS_OF_WEEK } from './business-hours';

/**
 * Converts API openingHours[] to frontend DaySchedule[] (7 items, one per day).
 * Groups multiple entries per dayOfWeek into intervals.
 */
export function openingHoursToSchedule(openingHours: OpeningHours[]): DaySchedule[] {
  const grouped = new Map<number, OpeningHours[]>();

  for (const oh of openingHours ?? []) {
    const list = grouped.get(oh.dayOfWeek) ?? [];
    list.push(oh);
    grouped.set(oh.dayOfWeek, list);
  }

  return DAYS_OF_WEEK.map((day) => {
    const entries = grouped.get(day.id) ?? [];
    return {
      dayOfWeek: day.id,
      isOpen: entries.length > 0,
      intervals: entries.map((e) => ({
        start: e.openingHour.substring(0, 5),
        end: e.closingHour.substring(0, 5),
      })),
    };
  });
}

/**
 * Converts frontend DaySchedule[] back to API openingHours[] format.
 * Only includes open days. Appends :00 seconds if needed.
 */
export function scheduleToOpeningHours(schedule: DaySchedule[]): OpeningHours[] {
  const result: OpeningHours[] = [];

  for (const day of schedule) {
    if (!day.isOpen) continue;
    for (const interval of day.intervals) {
      result.push({
        dayOfWeek: day.dayOfWeek,
        openingHour: interval.start.length === 5 ? interval.start + ':00' : interval.start,
        closingHour: interval.end.length === 5 ? interval.end + ':00' : interval.end,
      });
    }
  }

  return result;
}
