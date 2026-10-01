import { dateKey } from './drinks';

// Hong Kong general holidays (公眾假期), as gazetted by the HKSAR Government.
// Source: https://www.gov.hk/tc/about/abouthk/holiday/2026.htm and .../2027.htm
// Data runs through 2027-12-31. Dates after that are treated as normal working days
// until a new year is added below.
export const HK_HOLIDAYS = {
  // 2026
  '2026-01-01': '一月一日',
  '2026-02-17': '農曆年初一',
  '2026-02-18': '農曆年初二',
  '2026-02-19': '農曆年初三',
  '2026-04-03': '耶穌受難節',
  '2026-04-04': '耶穌受難節翌日',
  '2026-04-06': '清明節翌日',
  '2026-04-07': '復活節星期一翌日',
  '2026-05-01': '勞動節',
  '2026-05-25': '佛誕翌日',
  '2026-06-19': '端午節',
  '2026-07-01': '香港特別行政區成立紀念日',
  '2026-09-26': '中秋節翌日',
  '2026-10-01': '國慶日',
  '2026-10-19': '重陽節翌日',
  '2026-12-25': '聖誕節',
  '2026-12-26': '聖誕節後第一個周日',
  // 2027
  '2027-01-01': '一月一日',
  '2027-02-06': '農曆年初一',
  '2027-02-08': '農曆年初三',
  '2027-02-09': '農曆年初四（補假）',
  '2027-03-26': '耶穌受難節',
  '2027-03-27': '耶穌受難節翌日',
  '2027-03-29': '復活節星期一',
  '2027-04-05': '清明節',
  '2027-05-01': '勞動節',
  '2027-05-13': '佛誕',
  '2027-06-09': '端午節',
  '2027-07-01': '香港特別行政區成立紀念日',
  '2027-09-16': '中秋節翌日',
  '2027-10-01': '國慶日',
  '2027-10-08': '重陽節',
  '2027-12-25': '聖誕節',
  '2027-12-27': '聖誕節後第一個周日',
};

// Working day = Monday–Friday and not a general holiday.
export function isWorkday(date) {
  const dow = date.getDay();
  return dow >= 1 && dow <= 5 && !HK_HOLIDAYS[dateKey(date)];
}

// First working day strictly after `date` (returned at local midnight).
export function nextWorkday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  for (let i = 0; i < 30; i++) {
    d.setDate(d.getDate() + 1);
    if (isWorkday(d)) return d;
  }
  return d;
}
