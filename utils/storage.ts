// Storage utility for persisting timechart data to AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeChartData } from '../types';

const TIMECHART_KEY = '@construction_timechart:';

export const saveTimechart = async (timechart: TimeChartData): Promise<void> => {
  try {
    const key = `${TIMECHART_KEY}${timechart.id}`;
    const jsonValue = JSON.stringify({
      ...timechart,
      startDate: new Date(timechart.startDate).toISOString(),
      endDate: new Date(timechart.endDate).toISOString(),
      nonWorkingDays: (timechart.nonWorkingDays || []).map(h => ({
        ...h,
        date: new Date(h.date).toISOString()
      })),
      // Keep publicHolidays for backward compatibility
      publicHolidays: (timechart.publicHolidays || []).map(h => ({
        ...h,
        date: new Date(h.date).toISOString()
      })),
      activities: timechart.activities.map(a => ({
        ...a,
        startDate: new Date(a.startDate).toISOString(),
        endDate: new Date(a.endDate).toISOString()
      })),
      dailyActivityLogs: timechart.dailyActivityLogs.map(log => ({
        ...log,
        date: new Date(log.date).toISOString(),
        createdAt: new Date(log.createdAt).toISOString(),
        updatedAt: new Date(log.updatedAt).toISOString()
      })),
      createdAt: new Date(timechart.createdAt).toISOString(),
      updatedAt: new Date(timechart.updatedAt).toISOString()
    });
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error saving timechart:', error);
    throw error;
  }
};

export const getTimechart = async (id: string): Promise<TimeChartData | null> => {
  try {
    const key = `${TIMECHART_KEY}${id}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (!jsonValue) return null;

    const data = JSON.parse(jsonValue);
    const timechart = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      nonWorkingDays: (data.nonWorkingDays || data.publicHolidays || []).map((h: any) => ({
        ...h,
        date: new Date(h.date)
      })),
      // Keep publicHolidays for backward compatibility
      publicHolidays: (data.publicHolidays || data.nonWorkingDays || []).map((h: any) => ({
        ...h,
        date: new Date(h.date)
      })),
      activities: data.activities.map((a: any) => ({
        ...a,
        startDate: new Date(a.startDate),
        endDate: new Date(a.endDate)
      })),
      dailyActivityLogs: (data.dailyActivityLogs || []).map((log: any) => ({
        ...log,
        date: new Date(log.date),
        createdAt: new Date(log.createdAt),
        updatedAt: new Date(log.updatedAt)
      })),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
    
    // Apply migration to ensure floorLevels exist
    return migrateTimechartToFloorLevels(timechart);
  } catch (error) {
    console.error('Error retrieving timechart:', error);
    return null;
  }
};

export const getAllTimecharts = async (): Promise<TimeChartData[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const timechartKeys = keys.filter((k: string) => k.startsWith(TIMECHART_KEY));
    const timecharts = await AsyncStorage.multiGet(timechartKeys);

    return timecharts
      .map(([, jsonValue]: [string, string | null]) => {
        if (!jsonValue) return null;
        const data = JSON.parse(jsonValue);
        const timechart = {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          nonWorkingDays: (data.nonWorkingDays || data.publicHolidays || []).map((h: any) => ({
            ...h,
            date: new Date(h.date)
          })),
          // Keep publicHolidays for backward compatibility
          publicHolidays: (data.publicHolidays || data.nonWorkingDays || []).map((h: any) => ({
            ...h,
            date: new Date(h.date)
          })),
          activities: data.activities.map((a: any) => ({
            ...a,
            startDate: new Date(a.startDate),
            endDate: new Date(a.endDate)
          })),
          dailyActivityLogs: (data.dailyActivityLogs || []).map((log: any) => ({
            ...log,
            date: new Date(log.date),
            createdAt: new Date(log.createdAt),
            updatedAt: new Date(log.updatedAt)
          })),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
        // Apply migration to ensure floorLevels exist
        return migrateTimechartToFloorLevels(timechart);
      })
      .filter((item: TimeChartData | null): item is TimeChartData => item !== null);
  } catch (error) {
    console.error('Error retrieving all timecharts:', error);
    return [];
  }
};

export const deleteTimechart = async (id: string): Promise<void> => {
  try {
    const key = `${TIMECHART_KEY}${id}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting timechart:', error);
    throw error;
  }
};

export const updateTimechartTimestamp = async (timechart: TimeChartData): Promise<void> => {
  timechart.updatedAt = new Date();
  await saveTimechart(timechart);
};

/**
 * Migrates a timechart to ensure it has the required floorLevels array
 * This handles timecharts created before the floor level feature was added
 */
export const migrateTimechartToFloorLevels = (timechart: TimeChartData): TimeChartData => {
  if (!timechart.floorLevels || timechart.floorLevels.length === 0) {
    return {
      ...timechart,
      floorLevels: [
        {
          id: 'floor-0',
          name: 'Ground Floor',
          levelNumber: 0,
          color: '#FF6B6B'
        },
        {
          id: 'floor-1',
          name: 'First Floor',
          levelNumber: 1,
          color: '#4ECDC4'
        },
        {
          id: 'floor-2',
          name: 'Second Floor',
          levelNumber: 2,
          color: '#45B7D1'
        }
      ]
    };
  }
  return timechart;
};
