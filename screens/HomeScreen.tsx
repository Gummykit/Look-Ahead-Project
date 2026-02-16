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
} from 'react-native';
import { TimeChartData } from '../types';
import { getAllTimecharts, deleteTimechart } from '../utils/storage';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [timecharts, setTimecharts] = useState<TimeChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTimecharts();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTimecharts = async () => {
    setLoading(true);
    const data = await getAllTimecharts();
    setTimecharts(data);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Timechart',
      'Are you sure you want to delete this timechart?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteTimechart(id);
            loadTimecharts();
          },
        },
      ]
    );
  };

  const renderTimechartItem = ({ item }: { item: TimeChartData }) => (
    <TouchableOpacity
      style={styles.timechartCard}
      onPress={() => navigation.navigate('Editor', { timechartId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.projectName}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButton}>✕</Text>
        </TouchableOpacity>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Construction Timechart</Text>
        <Text style={styles.headerSubtitle}>Manage project schedules and activities</Text>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProject')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

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
