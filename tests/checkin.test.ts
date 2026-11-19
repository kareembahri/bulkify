import { describe, expect, it } from 'vitest';
import { checkinDue, dueFrom, windowStart } from '../lib/checkin';

describe('monthly weight check-in', () => {
  it('opens on the last 3 days of the month', () => {
    expect(windowStart('2026-11')).toBe('2026-11-28');
    expect(windowStart('2026-02')).toBe('2026-02-26');
    expect(windowStart('2028-02')).toBe('2028-02-27');
  });
  it('is not due mid-month after a weigh-in at the last window', () => {
    expect(dueFrom('2026-11-19')).toBe('2026-10-29');
    expect(checkinDue('2026-11-19', '2026-10-30')).toBe(false);
    expect(checkinDue('2026-11-19', '2026-11-10')).toBe(false);
  });
  it('is due inside the window until a new weigh-in', () => {
    expect(checkinDue('2026-11-28', '2026-11-10')).toBe(true);
    expect(checkinDue('2026-11-29', '2026-11-28')).toBe(false);
  });
  it('is still due next month when the window was missed', () => {
    expect(checkinDue('2026-12-02', '2026-11-10')).toBe(true);
    expect(checkinDue('2027-01-05', '2026-12-30')).toBe(false);
  });
  it('is due when there is no weigh-in at all', () => {
    expect(checkinDue('2026-11-19', null)).toBe(true);
  });
});
