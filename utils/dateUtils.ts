// Date utility functions for timechart calculations

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Reset time to midnight to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isPublicHoliday = (date: Date, holidays: { date: Date }[]): boolean => {
  if (!holidays || holidays.length === 0) return false;
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === holidayDate.getTime();
  });
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const formatDate = (date: Date, format: string = 'MMM DD, YYYY'): string => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('MMM', d.toLocaleDateString('en-US', { month: 'short' }));
};

export const generateColorForIndex = (index: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8D5BA'
  ];
  return colors[index % colors.length];
};

export const isActivityOverlapping = (
  activity1: { startDate: Date; endDate: Date },
  activity2: { startDate: Date; endDate: Date }
): boolean => {
  const start1 = new Date(activity1.startDate);
  const end1 = new Date(activity1.endDate);
  const start2 = new Date(activity2.startDate);
  const end2 = new Date(activity2.endDate);

  return start1 <= end2 && start2 <= end1;
};

export const sortActivitiesByDate = (activities: any[]): any[] => {
  return [...activities].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
};

export const getMonthsInRange = (startDate: Date, endDate: Date): { month: string; year: number }[] => {
  const months = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    months.push({
      month: current.toLocaleDateString('en-US', { month: 'short' }),
      year: current.getFullYear()
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
};
