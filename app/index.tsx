import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { TimeChartData } from '@/types';
import { getAllTimecharts, deleteTimechart } from '@/utils/storage';
import { useAuth } from '@/hooks/useAuth';
import { canPerformAction, getRoleDisplayName } from '@/utils/rolePermissions';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [timecharts, setTimecharts] = useState<TimeChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const canDeleteProjects = user && canPerformAction(user.role, 'canDelete');
  const canCreateProjects = user && canPerformAction(user.role, 'canEdit');

  useFocusEffect(
    React.useCallback(() => {
      loadTimecharts();
    }, [])
  );

  const loadTimecharts = async () => {
    setLoading(true);
    const data = await getAllTimecharts();
    setTimecharts(data);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    if (!canDeleteProjects) {
      Alert.alert('Permission Denied', 'You do not have permission to delete projects');
      return;
    }

    Alert.alert(
      'Delete Timechart',
      'Are you sure you want to delete this timechart? This action cannot be undone.',
      [
        { 
          text: 'Cancel', 
          onPress: () => console.log('Delete cancelled'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteTimechart(id);
              await loadTimecharts();
              Alert.alert('Success', 'Timechart deleted successfully');
            } catch (error) {
              console.error('Error deleting timechart:', error);
              Alert.alert('Error', 'Failed to delete timechart');
            }
          },
          style: 'destructive'
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
            // Layout will automatically show login screen when isLoggedIn becomes false
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderTimechartItem = ({ item }: { item: TimeChartData }) => (
    <TouchableOpacity
      style={styles.timechartCard}
      onPress={() => router.push(`/editor?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.projectName}</Text>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.6}
        >
          <Text style={styles.deleteButton}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.companyInfoRow}>
        <Text style={styles.companyText}>{item.companyName}</Text>
        <Text style={styles.locationText}>{item.projectLocation}</Text>
      </View>
      {item.projectDescription && (
        <Text style={styles.cardDescription}>{item.projectDescription}</Text>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </Text>
        <Text style={styles.cardStats}>
          {item.subcontractors.length} contractors · {item.activities.length} activities
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>👤 {user?.fullName}</Text>
          <Text style={styles.userRole}>{getRoleDisplayName(user?.role || 'builder')}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Construction Timechart</Text>
        <Text style={styles.headerSubtitle}>
          {canCreateProjects ? 'Manage project schedules and activities' : 'View project timecharts'}
        </Text>
      </View>

      {timecharts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Timecharts Yet</Text>
          <Text style={styles.emptyText}>
            Create a new timechart to get started with planning your construction project.
          </Text>
        </View>
      ) : (
        <FlatList
          data={timecharts}
          renderItem={renderTimechartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
        />
      )}

      {canCreateProjects && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-project')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
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
    padding: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CCE5FF',
  },
  userHeader: {
    backgroundColor: '#005BA6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#CCE5FF',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  timechartCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  companyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0066CC',
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    fontSize: 24,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  cardStats: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 36,
    color: '#FFF',
    fontWeight: '300',
  },
});
