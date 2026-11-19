// Monthly weight check-in. From the last WINDOW_DAYS days of each month the app
// asks for the current weight and will not open until it is entered. If the
// app was not opened in that window, it asks on the next open (next month).
// Pure functions, unit-tested in tests/checkin.test.ts.
import { addDays, addMonths } from './dates';

export const WINDOW_DAYS = 3;

const lastDayOf = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`;
};

/** First day of the check-in window for a 'YYYY-MM' month. */
export const windowStart = (month: string) => addDays(lastDayOf(month), -(WINDOW_DAYS - 1));

/** The date from which a weigh-in counts for the most recent check-in. */
export function dueFrom(today: string) {
  const thisWindow = windowStart(today.slice(0, 7));
  return today >= thisWindow ? thisWindow : windowStart(addMonths(today.slice(0, 7) + '-01', -1).slice(0, 7));
}

/** True when the user must enter their weight before using the app. */
export const checkinDue = (today: string, lastWeighIn: string | null) => !lastWeighIn || lastWeighIn < dueFrom(today);
