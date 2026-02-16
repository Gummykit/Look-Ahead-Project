import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TimeChartData } from '../types';
import { getDaysBetween, getMonthsInRange, isPublicHoliday } from '../utils/dateUtils';

interface TimeChartViewProps {
  timechart: TimeChartData;
}

export const TimeChartView: React.FC<TimeChartViewProps> = ({ timechart }) => {
  const { width } = Dimensions.get('window');
  const DAY_WIDTH = 50;
  const ACTIVITY_LABEL_WIDTH = 150;
  const CONTRACTOR_LABEL_WIDTH = 130;

  const totalDays = getDaysBetween(timechart.startDate, timechart.endDate);
  const chartWidth = totalDays * DAY_WIDTH + ACTIVITY_LABEL_WIDTH + CONTRACTOR_LABEL_WIDTH;

  const months = useMemo(
    () => getMonthsInRange(timechart.startDate, timechart.endDate),
    [timechart.startDate, timechart.endDate]
  );

  const renderDayHeaders = () => {
    const items = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(timechart.startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const isHoliday = isPublicHoliday(currentDate, timechart.publicHolidays);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const dayOfMonth = currentDate.getDate();
      const dayName = currentDate.toLocaleString('en-US', { weekday: 'short' });

      let backgroundColor = '#FFF';
      if (isHoliday) backgroundColor = '#FFE0E0';
      if (isWeekend) backgroundColor = '#F0F0F0';

      items.push(
        <View
          key={`day-${i}`}
          style={[
            styles.dayHeaderCell,
            {
              width: DAY_WIDTH,
              backgroundColor,
            },
          ]}
        >
          <Text style={styles.dayHeaderText}>{dayName}</Text>
          <Text style={styles.dateText}>{dayOfMonth}</Text>
        </View>
      );
    }

    return items;
  };

  const renderMonthHeaders = () => {
    const items = [];
    let currentMonth = '';
    let monthStartIndex = 0;
    let dayCount = 0;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(timechart.startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const monthKey = currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      if (monthKey !== currentMonth) {
        // Push the previous month if it exists
        if (currentMonth !== '') {
          items.push(
            <View
              key={`month-${monthStartIndex}`}
              style={[
                styles.monthHeaderCell,
                { width: dayCount * DAY_WIDTH },
              ]}
            >
              <Text style={styles.monthHeaderText}>{currentMonth}</Text>
            </View>
          );
        }
        
        currentMonth = monthKey;
        monthStartIndex = i;
        dayCount = 1;
      } else {
        dayCount++;
      }
    }

    // Push the last month
    if (currentMonth !== '') {
      items.push(
        <View
          key={`month-${monthStartIndex}`}
          style={[
            styles.monthHeaderCell,
            { width: dayCount * DAY_WIDTH },
          ]}
        >
          <Text style={styles.monthHeaderText}>{currentMonth}</Text>
        </View>
      );
    }

    return items;
  };

  const renderActivityRows = () => {
    return timechart.activities.map((activity) => {
      const activityStartDay = getDaysBetween(timechart.startDate, activity.startDate);
      const contractorName = timechart.subcontractors.find(
        c => c.id === activity.subcontractorId
      )?.name || 'Unassigned';

      return (
        <View key={`activity-${activity.id}`} style={styles.activityRowContainer}>
          {/* Activity Name Cell */}
          <View style={[styles.cell, styles.activityCell, { width: ACTIVITY_LABEL_WIDTH }]}>
            <Text style={styles.activityCellText} numberOfLines={2}>
              {activity.name}
            </Text>
          </View>

          {/* Contractor Cell */}
          <View style={[styles.cell, styles.contractorCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
            <View
              style={[
                styles.contractorColorDot,
                { backgroundColor: activity.color || '#0066CC' },
              ]}
            />
            <Text style={styles.contractorCellText} numberOfLines={1}>
              {contractorName}
            </Text>
          </View>

          {/* Date Cells with Activity Bar */}
          {renderDateCells(activity, activityStartDay)}
        </View>
      );
    });
  };

  const renderDateCells = (activity: any, startDay: number) => {
    const cells = [];
    const endDay = startDay + getDaysBetween(activity.startDate, activity.endDate);

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(timechart.startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const isHoliday = isPublicHoliday(currentDate, timechart.publicHolidays);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isActivityDay = i >= startDay && i < endDay;
      
      // Activity should NOT show on holidays or weekends
      const shouldShowActivity = isActivityDay && !isHoliday && !isWeekend;

      let backgroundColor = '#FFF';
      if (isHoliday) backgroundColor = '#FFE0E0';
      if (isWeekend) backgroundColor = '#F0F0F0';

      cells.push(
        <View
          key={`cell-${i}`}
          style={[
            styles.cell,
            styles.dateCell,
            {
              width: DAY_WIDTH,
              backgroundColor,
            },
          ]}
        >
          {shouldShowActivity && (
            <View
              style={[
                styles.activityIndicator,
                { backgroundColor: activity.color || '#0066CC' },
              ]}
            />
          )}
        </View>
      );
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ width: Math.max(chartWidth, width - 16) }}
      >
        <View>
          {/* Month Header Row */}
          <View style={styles.monthHeaderRow}>
            <View style={[styles.cell, styles.headerLabelCell, { width: ACTIVITY_LABEL_WIDTH }]}>
              <Text style={styles.monthPlaceholderText}></Text>
            </View>
            <View style={[styles.cell, styles.headerLabelCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
              <Text style={styles.monthPlaceholderText}></Text>
            </View>
            <View style={styles.monthHeaderDateContent}>
              {renderMonthHeaders()}
            </View>
          </View>

          {/* Header Row with Day Names and Dates */}
          <View style={styles.headerRow}>
            <View style={[styles.cell, styles.headerLabelCell, { width: ACTIVITY_LABEL_WIDTH }]}>
              <Text style={styles.headerCellText}>ACTIVITY</Text>
            </View>
            <View style={[styles.cell, styles.headerLabelCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
              <Text style={styles.headerCellText}>CONTRACTOR</Text>
            </View>
            <View style={styles.headerDateContent}>
              {renderDayHeaders()}
            </View>
          </View>

          {/* Activity Rows */}
          <View>
            {timechart.activities.length > 0 ? (
              renderActivityRows()
            ) : (
              <View style={[styles.cell, { padding: 16, marginTop: 10 }]}>
                <Text style={styles.emptyText}>No activities added yet</Text>
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={[styles.cell, { width: ACTIVITY_LABEL_WIDTH + CONTRACTOR_LABEL_WIDTH }]} />
            <View style={styles.legendContent}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#FFE0E0' }]} />
                <Text style={styles.legendText}>Holiday</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#F0F0F0' }]} />
                <Text style={styles.legendText}>Weekend</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  monthHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F1FF',
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
  },
  monthHeaderDateContent: {
    flexDirection: 'row',
  },
  monthHeaderCell: {
    borderRightWidth: 1,
    borderRightColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  monthHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0066CC',
    textAlign: 'center',
  },
  monthPlaceholderText: {
    fontSize: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    borderBottomWidth: 2,
    borderBottomColor: '#0052A3',
  },
  headerDateContent: {
    flexDirection: 'row',
  },
  cell: {
    borderRightWidth: 1,
    borderRightColor: '#DDD',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerLabelCell: {
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  dayHeaderCell: {
    borderRightWidth: 1,
    borderRightColor: '#CCC',
    borderBottomWidth: 2,
    borderBottomColor: '#0052A3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#333',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066CC',
    marginTop: 2,
  },
  activityRowContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    minHeight: 60,
  },
  activityCell: {
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 2,
    borderRightColor: '#0066CC',
  },
  activityCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    lineHeight: 16,
  },
  contractorCell: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 2,
    borderRightColor: '#0066CC',
    flexDirection: 'row',
  },
  contractorColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  contractorCellText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  dateCell: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  activityIndicator: {
    width: '90%',
    height: '70%',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  legendRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: '#DDD',
    backgroundColor: '#F9F9F9',
  },
  legendContent: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  monthHeaderRowOld: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    backgroundColor: '#F8F8F8',
  },
  monthHeaderContent: {
    flexDirection: 'row',
  },
  monthCell: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
  },
  monthText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    backgroundColor: '#FAFAFA',
  },
  weekHeaderContent: {
    flexDirection: 'row',
  },
  weekCell: {
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
  },
  weekText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#666',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
    backgroundColor: '#FFF',
  },
  dayHeaderLabels: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayHeaderLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0066CC',
    flex: 1,
    textAlign: 'center',
  },
  dayHeaderContent: {
    flexDirection: 'row',
  },
  dayCell: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderRightColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 8,
    fontWeight: '600',
    color: '#333',
  },
  labelColumnHeader: {
    backgroundColor: '#F0F0F0',
    borderRightWidth: 2,
    borderRightColor: '#0066CC',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
