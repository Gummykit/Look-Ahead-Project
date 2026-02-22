import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, clearStoredSession } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { getRoleDisplayName, getRoleDescription, getAllRoles } from '@/utils/rolePermissions';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('contractor1');
  const [email, setEmail] = useState('contractor@example.com');
  const [password, setPassword] = useState('contractor123');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('contractor');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    console.log('🟣 [Login] Attempting login with:', { username, password, selectedRole });
    setLoading(true);
    try {
      await login(username, password, selectedRole);
      console.log('🟣 [Login] Login successful, navigating to home');
      // Explicitly navigate to home screen after successful login
      router.replace('/');
    } catch (error: any) {
      console.log('🟣 [Login] Login failed:', error.message);
      // Check if the username matches a known account but wrong role was selected
      const knownUsernames = ['contractor1', 'subcontractor1', 'observer1'];
      if (knownUsernames.includes(username.trim())) {
        Alert.alert(
          'Login Failed',
          'Invalid credentials or role mismatch.\n\nMake sure:\n1. Username is correct\n2. Password is correct (e.g., contractor123)\n3. Role matches the account\n\nDemo accounts:\n• contractor1 → Contractor role\n• subcontractor1 → Sub-contractor role\n• observer1 → Observer role'
        );
      } else {
        Alert.alert('Login Failed', error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-suggest role based on username
  const handleUsernameChange = (text: string) => {
    setUsername(text);
    // Auto-select role if user types a known demo account username
    if (text === 'contractor1') {
      setSelectedRole('contractor');
    } else if (text === 'subcontractor1') {
      setSelectedRole('sub-contractor');
    } else if (text === 'observer1') {
      setSelectedRole('observer');
    }
  };

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password, selectedRole, fullName);
      setIsSignup(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName('');
      Alert.alert('Success', 'Account created! Please log in with your credentials');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const roles = getAllRoles();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignup
                ? 'Sign up to get started'
                : 'Log in to access your projects'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={username}
                onChangeText={handleUsernameChange}
                editable={!loading}
                placeholderTextColor="#999"
              />
            </View>

            {/* Email (only for signup) */}
            {isSignup && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!loading}
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* Full Name (only for signup) */}
            {isSignup && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                placeholderTextColor="#999"
              />
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Your Role</Text>
              <View style={styles.roleContainer}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      selectedRole === role && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole(role)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        selectedRole === role && styles.roleButtonTextActive,
                      ]}
                    >
                      {getRoleDisplayName(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.roleDescription}>
                {getRoleDescription(selectedRole)}
              </Text>
            </View>

            {/* Demo Credentials Info */}
            {!isSignup && (
              <View style={styles.demoInfo}>
                <Text style={styles.demoTitle}>Demo Credentials:</Text>
                <Text style={styles.demoText}>👷 Contractor: contractor1 / contractor123</Text>
                <Text style={styles.demoText}>🏗️ Sub-contractor: subcontractor1 / subcontractor123</Text>
                <Text style={styles.demoText}>�️ Observer: observer1 / observer123</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={isSignup ? handleSignup : handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignup ? 'Create Account' : 'Log In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Signup/Login */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsSignup(!isSignup);
                  setUsername('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                disabled={loading}
              >
                <Text style={styles.toggleLink}>
                  {isSignup ? 'Log In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Role Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Role Permissions</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoBold}>Contractor & Architect:</Text>
              <Text style={styles.infoText}>Full edit access</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoBold}>Builder:</Text>
              <Text style={styles.infoText}>View-only access</Text>
            </View>
          </View>

          {/* Dev Utility: Clear Stored Session */}
          <TouchableOpacity
            style={styles.clearSessionButton}
            onPress={async () => {
              await clearStoredSession();
              Alert.alert('Success', 'Stored session cleared. The app will now show the login screen on next start.');
            }}
          >
            <Text style={styles.clearSessionButtonText}>🔄 Clear Stored Session (Dev)</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  roleButtonTextActive: {
    color: '#FFF',
  },
  roleDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  demoInfo: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 6,
  },
  demoText: {
    fontSize: 11,
    color: '#856404',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  toggleLink: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '700',
  },
  infoContainer: {
    backgroundColor: '#E6F4FE',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  clearSessionButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  clearSessionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
