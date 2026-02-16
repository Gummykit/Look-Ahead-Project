import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TimeChartData } from '@/types';
import { saveTimechart } from '@/utils/storage';

export default function CreateProjectScreen() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    if (!companyName.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }

    if (!projectLocation.trim()) {
      Alert.alert('Error', 'Please enter a project location');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    const newTimechart: TimeChartData = {
      id: Math.random().toString(36).substr(2, 9),
      projectName: projectName.trim(),
      companyName: companyName.trim(),
      projectLocation: projectLocation.trim(),
      projectDescription: projectDescription.trim() || undefined,
      startDate: start,
      endDate: end,
      publicHolidays: [],
      subcontractors: [],
      floorLevels: [
        { id: '1', name: 'Ground Floor', levelNumber: 0, color: '#FF6B6B' },
        { id: '2', name: 'First Floor', levelNumber: 1, color: '#4ECDC4' },
        { id: '3', name: 'Second Floor', levelNumber: 2, color: '#45B7D1' },
      ],
      activities: [],
      dailyActivityLogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await saveTimechart(newTimechart);
      router.push(`/editor?id=${newTimechart.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create project. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Project</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Project Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project name"
            placeholderTextColor="#999"
            value={projectName}
            onChangeText={setProjectName}
          />
          <Text style={styles.hint}>e.g., Downtown Office Tower, Shopping Mall</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            placeholderTextColor="#999"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <Text style={styles.hint}>e.g., ABC Construction Ltd.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Project Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project location"
            placeholderTextColor="#999"
            value={projectLocation}
            onChangeText={setProjectLocation}
          />
          <Text style={styles.hint}>e.g., New York, NY or 123 Main Street, Boston</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Project Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional: Add description"
            placeholderTextColor="#999"
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Start Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>End Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProject}
        >
          <Text style={styles.createButtonText}>Create Project</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 40,
  },
  backButton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textArea: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  createButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
