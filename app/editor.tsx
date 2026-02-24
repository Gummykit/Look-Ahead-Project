import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TimeChartData } from '@/types';
import { getTimechart, saveTimechart } from '@/utils/storage';
import { UnifiedTimeChartEditor } from '@/components/UnifiedTimeChartEditor';
import { useAuth } from '@/hooks/useAuth';

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [timechart, setTimechart] = useState<TimeChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimechart();
  }, []);

  const loadTimechart = async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    const data = await getTimechart(id);
    setTimechart(data);
    setLoading(false);
  };

  const handleSaveTimechart = async () => {
    if (!timechart) return;
    try {
      await saveTimechart(timechart);
      Alert.alert('Success', 'Timechart saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save timechart');
    }
  };

  const handleAddHoliday = (holiday: any) => {
    if (!timechart) return;
    const nonWorkingDays = timechart.nonWorkingDays || [];
    const exists = nonWorkingDays.some(
      h => new Date(h.date).toDateString() === new Date(holiday.date).toDateString()
    );
    if (exists) {
      Alert.alert('Error', 'Non-working day already exists on this date');
      return;
    }
    setTimechart({
      ...timechart,
      nonWorkingDays: [
        ...nonWorkingDays,
        { ...holiday, id: Math.random().toString(36).substr(2, 9) }
      ],
    });
  };

  const handleRemoveHoliday = (id: string) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      nonWorkingDays: (timechart.nonWorkingDays || []).filter(h => h.id !== id),
    });
  };

  const handleAddSubcontractor = (name: string) => {
    if (!timechart) return;
    const exists = timechart.subcontractors.some(s => s.name === name);
    if (exists) {
      Alert.alert('Error', 'Subcontractor already exists');
      return;
    }
    setTimechart({
      ...timechart,
      subcontractors: [
        ...timechart.subcontractors,
        {
          id: Math.random().toString(36).substr(2, 9),
          name,
          isActive: true,
        },
      ],
    });
  };

  const handleRemoveSubcontractor = (id: string) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      subcontractors: timechart.subcontractors.filter(s => s.id !== id),
      activities: timechart.activities.filter(a => a.subcontractorId !== id),
    });
  };

  const handleAddActivity = (activity: any) => {
    if (!timechart) return;
    
    const parentActivityId = Math.random().toString(36).substr(2, 9);
    const newActivities = [
      ...timechart.activities,
      {
        ...activity,
        id: parentActivityId,
        sequenceOrder: timechart.activities.length + 1,
        childActivityIds: activity.childDuration ? [Math.random().toString(36).substr(2, 9)] : [],
      },
    ];
    
    // If child activity requested, create it
    if (activity.childDuration && activity.childActivityName) {
      const childActivityId = newActivities[newActivities.length - 1].childActivityIds?.[0];
      const childStartDate = new Date(activity.endDate);
      childStartDate.setDate(childStartDate.getDate() + 1); // Start day after parent ends
      const childEndDate = new Date(childStartDate);
      childEndDate.setDate(childEndDate.getDate() + (activity.childDuration - 1));
      
      newActivities.push({
        ...activity,
        id: childActivityId,
        name: activity.childActivityName,
        startDate: childStartDate,
        endDate: childEndDate,
        duration: activity.childDuration,
        parentActivityId: parentActivityId,
        sequenceOrder: newActivities.length + 1,
      });
    }
    
    setTimechart({
      ...timechart,
      activities: newActivities,
    });
  };

  const handleUpdateActivity = (id: string, updatedActivity: any) => {
    if (!timechart) return;

    // Find the original activity to compare dates
    const originalActivity = timechart.activities.find(a => a.id === id);
    if (!originalActivity) return;

    console.log('🟢 [Update] Activity update received:', {
      id: id,
      originalStartDate: originalActivity.startDate,
      newStartDate: updatedActivity.startDate,
      isParent: !originalActivity.parentActivityId,
      childActivityIds: originalActivity.childActivityIds,
      hasChildUpdates: !!updatedActivity.childUpdates,
    });

    // Normalize dates for comparison (remove time component, use UTC)
    const normalizeDate = (date: Date | string) => {
      const d = new Date(date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
    };

    // Check if the dates have changed (e.g., due to dragging)
    const startDateChanged = updatedActivity.startDate && 
      normalizeDate(updatedActivity.startDate) !== normalizeDate(originalActivity.startDate);
    const endDateChanged = updatedActivity.endDate && 
      normalizeDate(updatedActivity.endDate) !== normalizeDate(originalActivity.endDate);

    console.log('� [Update] Date changes detected:', {
      startDateChanged: startDateChanged,
      endDateChanged: endDateChanged,
      oldStart: normalizeDate(originalActivity.startDate),
      newStart: normalizeDate(updatedActivity.startDate),
    });

    // If childUpdates are included, use them directly (they're already calculated in the component)
    // Otherwise, calculate child updates if this is a parent (for non-drag updates)
    let childUpdates: any[] = [];
    if (updatedActivity.childUpdates) {
      // Use the child updates passed from the drag handler
      childUpdates = updatedActivity.childUpdates;
      console.log('🟢 [Update] Using passed childUpdates:', childUpdates.length);
    } else if ((startDateChanged || endDateChanged) && originalActivity.childActivityIds && originalActivity.childActivityIds.length > 0) {
      // Calculate child offsets only for non-drag updates
      const oldStart = new Date(originalActivity.startDate);
      const newStart = new Date(updatedActivity.startDate);
      
      oldStart.setUTCHours(0, 0, 0, 0);
      newStart.setUTCHours(0, 0, 0, 0);
      
      const daysDifference = Math.round(
        (newStart.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log('🟢 [Update] Parent moved, calculating child offsets:', {
        daysDifference: daysDifference,
        childCount: originalActivity.childActivityIds.length,
      });

      // Update all child activities by the same offset
      originalActivity.childActivityIds.forEach((childId) => {
        const childActivity = timechart.activities.find(a => a.id === childId);
        if (childActivity) {
          const newChildStartDate = new Date(childActivity.startDate);
          newChildStartDate.setDate(newChildStartDate.getDate() + daysDifference);
          const newChildEndDate = new Date(childActivity.endDate);
          newChildEndDate.setDate(newChildEndDate.getDate() + daysDifference);
          
          childUpdates.push({
            childId: childId,
            updates: {
              startDate: newChildStartDate,
              endDate: newChildEndDate,
              duration: childActivity.duration,
            }
          });
        }
      });
    }

    // Create the updated activity object (without childUpdates property)
    const { childUpdates: _, ...activityToUpdate } = updatedActivity;

    let updatedTimechart = {
      ...timechart,
      activities: timechart.activities.map(a => {
        if (a.id === id) {
          const updated = { ...a, ...activityToUpdate };
          console.log('🟢 [Update] Activity map - parent updated:', {
            id: id,
            oldStart: a.startDate,
            newStart: updated.startDate,
          });
          return updated;
        }
        // Also apply child updates if any
        const childUpdate = childUpdates.find((cu: any) => cu.childId === a.id);
        if (childUpdate) {
          const updated = { ...a, ...childUpdate.updates };
          console.log('🟢 [Update] Activity map - child updated:', {
            id: a.id,
            oldStart: a.startDate,
            newStart: updated.startDate,
          });
          return updated;
        }
        return a;
      }),
    };

    console.log('🟢 [Update] Updated timechart activities:', updatedTimechart.activities.map(a => ({
      id: a.id,
      name: a.name,
      startDate: a.startDate,
    })));

    // If dates changed, migrate daily activity logs to new dates
    if ((startDateChanged || endDateChanged) && timechart.dailyActivityLogs.length > 0) {
      // Calculate the date offset (how many days the activity was moved)
      const oldStart = new Date(originalActivity.startDate);
      const newStart = new Date(updatedActivity.startDate);
      
      // Normalize to midnight UTC for accurate day difference calculation
      oldStart.setUTCHours(0, 0, 0, 0);
      newStart.setUTCHours(0, 0, 0, 0);
      
      const daysDifference = Math.round(
        (newStart.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log('🟡 [Daily Logs] Activity moved. Old start:', oldStart.toISOString(), 'New start:', newStart.toISOString());
      console.log('🟡 [Daily Logs] Days difference:', daysDifference);

      if (daysDifference !== 0) {
        console.log('🟡 [Daily Logs] Found logs to migrate for activity:', id);
        
        // Migrate all daily logs for this activity
        const migratedLogs = timechart.dailyActivityLogs.map(log => {
          if (log.activityId === id) {
            // Create new date by shifting the log date by the same offset
            const oldLogDate = new Date(log.date);
            oldLogDate.setUTCHours(0, 0, 0, 0);
            
            const newLogDate = new Date(oldLogDate);
            newLogDate.setDate(newLogDate.getDate() + daysDifference);
            
            console.log('🟡 [Daily Logs] Migrating log from', oldLogDate.toISOString().split('T')[0], 'to', newLogDate.toISOString().split('T')[0]);
            
            return {
              ...log,
              date: newLogDate,
              updatedAt: new Date(),
            };
          }
          return log;
        });

        updatedTimechart = {
          ...updatedTimechart,
          dailyActivityLogs: migratedLogs,
        };
      } else {
        console.log('🟡 [Daily Logs] No date change detected (daysDifference is 0)');
      }
    }

    console.log('🟢 [Update] Calling setTimechart with updated activities');
    setTimechart(updatedTimechart);
  };

  const handleRemoveActivity = (id: string) => {
    if (!timechart) return;
    
    // Find the activity to check if it's a parent with children
    const activity = timechart.activities.find(a => a.id === id);
    const childIds = activity?.childActivityIds || [];
    
    // Remove the activity and its children
    const idsToRemove = [id, ...childIds];
    setTimechart({
      ...timechart,
      activities: timechart.activities.filter(a => !idsToRemove.includes(a.id)),
    });
  };

  const handleAddFloorLevel = (floorLevel: any) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      floorLevels: [
        ...(timechart.floorLevels || []),
        {
          ...floorLevel,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    });
  };

  const handleUpdateFloorLevel = (id: string, updatedFloorLevel: any) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      floorLevels: (timechart.floorLevels || []).map(f =>
        f.id === id ? { ...f, ...updatedFloorLevel } : f
      ),
    });
  };

  const handleRemoveFloorLevel = (id: string) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      floorLevels: (timechart.floorLevels || []).filter(f => f.id !== id),
      // Remove activities that used this floor level
      activities: timechart.activities.filter(a => a.floorLevelId !== id),
    });
  };

  const handleAddOrUpdateDailyLog = (activityId: string, date: Date, notes: string, imageUris: string[]) => {
    if (!timechart) return;
    
    const existingLogIndex = timechart.dailyActivityLogs.findIndex(
      log => log.activityId === activityId && new Date(log.date).toDateString() === date.toDateString()
    );

    if (existingLogIndex >= 0) {
      // Update existing log
      const updatedLogs = [...timechart.dailyActivityLogs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        notes,
        imageUris,
        updatedAt: new Date(),
      };
      setTimechart({
        ...timechart,
        dailyActivityLogs: updatedLogs,
      });
    } else {
      // Add new log
      setTimechart({
        ...timechart,
        dailyActivityLogs: [
          ...timechart.dailyActivityLogs,
          {
            id: Math.random().toString(36).substr(2, 9),
            activityId,
            date,
            notes,
            imageUris,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
    }
  };

  const handleRemoveDailyLog = (logId: string) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      dailyActivityLogs: timechart.dailyActivityLogs.filter(log => log.id !== logId),
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!timechart) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load timechart</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{timechart.projectName}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{timechart.companyName} • {timechart.projectLocation}</Text>
        </View>
        <TouchableOpacity onPress={handleSaveTimechart}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <UnifiedTimeChartEditor
        key={timechart.id}
        timechart={timechart}
        user={user}
        onAddNonWorkingDay={handleAddHoliday}
        onRemoveNonWorkingDay={handleRemoveHoliday}
        onAddSubcontractor={handleAddSubcontractor}
        onRemoveSubcontractor={handleRemoveSubcontractor}
        onAddActivity={handleAddActivity}
        onRemoveActivity={handleRemoveActivity}
        onUpdateActivity={handleUpdateActivity}
        onAddFloorLevel={handleAddFloorLevel}
        onUpdateFloorLevel={handleUpdateFloorLevel}
        onRemoveFloorLevel={handleRemoveFloorLevel}
        onAddOrUpdateDailyLog={handleAddOrUpdateDailyLog}
        onRemoveDailyLog={handleRemoveDailyLog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#CCE5FF',
    marginTop: 2,
  },
  saveButton: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
