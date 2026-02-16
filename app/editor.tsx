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

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
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
    const exists = timechart.publicHolidays.some(
      h => new Date(h.date).toDateString() === new Date(holiday.date).toDateString()
    );
    if (exists) {
      Alert.alert('Error', 'Holiday already exists on this date');
      return;
    }
    setTimechart({
      ...timechart,
      publicHolidays: [
        ...timechart.publicHolidays,
        { ...holiday, id: Math.random().toString(36).substr(2, 9) }
      ],
    });
  };

  const handleRemoveHoliday = (id: string) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      publicHolidays: timechart.publicHolidays.filter(h => h.id !== id),
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
    setTimechart({
      ...timechart,
      activities: [
        ...timechart.activities,
        {
          ...activity,
          id: Math.random().toString(36).substr(2, 9),
          sequenceOrder: timechart.activities.length + 1,
        },
      ],
    });
  };

  const handleUpdateActivity = (id: string, updatedActivity: any) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      activities: timechart.activities.map(a =>
        a.id === id ? { ...a, ...updatedActivity } : a
      ),
    });
  };

  const handleRemoveActivity = (id: string) => {
    if (!timechart) return;
    setTimechart({
      ...timechart,
      activities: timechart.activities.filter(a => a.id !== id),
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
        onAddHoliday={handleAddHoliday}
        onRemoveHoliday={handleRemoveHoliday}
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
