import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { TimeChartData } from '@/types';
import { saveTimechart } from '@/utils/storage';

export default function CreateProjectScreen() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUri, setCompanyLogoUri] = useState<string | null>(null);
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handlePickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setCompanyLogoUri(result.assets[0].uri);
    }
  };

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
      companyLogoUri: companyLogoUri || undefined,
      projectLocation: projectLocation.trim(),
      projectDescription: projectDescription.trim() || undefined,
      startDate: start,
      endDate: end,
      nonWorkingDays: [],
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
          <Text style={styles.label}>Company / Builder Logo</Text>
          <TouchableOpacity style={styles.logoPickerButton} onPress={handlePickLogo}>
            {companyLogoUri ? (
              <Image source={{ uri: companyLogoUri }} style={styles.logoPreview} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderIcon}>🏢</Text>
                <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
                <Text style={styles.logoPlaceholderHint}>Square image recommended</Text>
              </View>
            )}
          </TouchableOpacity>
          {companyLogoUri && (
            <TouchableOpacity onPress={() => setCompanyLogoUri(null)} style={styles.removeLogoButton}>
              <Text style={styles.removeLogoText}>✕ Remove logo</Text>
            </TouchableOpacity>
          )}
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
  logoPickerButton: {
    borderWidth: 2,
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0F8FF',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPreview: {
    width: '100%',
    height: 160,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  logoPlaceholderIcon: {
    fontSize: 36,
  },
  logoPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  logoPlaceholderHint: {
    fontSize: 12,
    color: '#999',
  },
  removeLogoButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  removeLogoText: {
    fontSize: 12,
    color: '#CC0000',
    fontWeight: '600',
  },
});
