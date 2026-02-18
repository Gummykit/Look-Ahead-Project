import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthContext as IAuthContext } from '@/types';

// Create the context
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// Mock user database (in production, this would be a real backend)
const mockUsers: User[] = [
  {
    id: '1',
    username: 'contractor1',
    email: 'contractor@example.com',
    password: 'contractor123', // In production, this should be hashed
    role: 'contractor',
    fullName: 'John Contractor',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    username: 'architect1',
    email: 'architect@example.com',
    password: 'architect123',
    role: 'architect',
    fullName: 'Jane Architect',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    username: 'builder1',
    email: 'builder@example.com',
    password: 'builder123',
    role: 'builder',
    fullName: 'Bob Builder',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
];

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredUser();
  }, []);

  const login = async (username: string, password: string, role: UserRole) => {
    try {
      console.log('🟡 [Auth] login() called with:', { username, password, role });
      console.log('🟡 [Auth] Available mock users:', mockUsers.map(u => ({ username: u.username, password: u.password, role: u.role })));
      
      // Find user in mock database
      const foundUser = mockUsers.find(
        (u) => u.username === username && u.password === password && u.role === role
      );

      console.log('🟡 [Auth] foundUser:', foundUser ? `Found ${foundUser.username}` : 'NOT FOUND');

      if (!foundUser) {
        throw new Error('Invalid username, password, or role');
      }

      // Update last login
      const loggedInUser = {
        ...foundUser,
        lastLogin: new Date(),
      };

      // Save user to AsyncStorage
      await AsyncStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      console.log('🟡 [Auth] Saved to AsyncStorage');
      setUser(loggedInUser);
      console.log('🟡 [Auth] Set user state');
      setIsLoggedIn(true);
      console.log('🟡 [Auth] Set isLoggedIn to true');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🟡 [Auth] logout() called');
      await AsyncStorage.removeItem('currentUser');
      console.log('🟡 [Auth] removed currentUser from AsyncStorage');
      setUser(null);
      console.log('🟡 [Auth] set user to null');
      setIsLoggedIn(false);
      console.log('🟡 [Auth] set isLoggedIn to false');
    } catch (error) {
      console.error('🟡 [Auth] Logout error:', error);
      throw error;
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ) => {
    try {
      // Check if user already exists
      const userExists = mockUsers.some((u) => u.username === username || u.email === email);
      if (userExists) {
        throw new Error('Username or email already exists');
      }

      // Create new user
      const newUser: User = {
        id: String(mockUsers.length + 1),
        username,
        email,
        password, // In production, this should be hashed
        role,
        fullName,
        createdAt: new Date(),
      };

      // Add to mock database
      mockUsers.push(newUser);

      // Save user to AsyncStorage
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const value: IAuthContext = {
    user,
    isLoggedIn,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use the authentication context
 */
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Development utility: Clear stored session (for testing login flow)
 * WARNING: Only use for development/testing!
 */
export const clearStoredSession = async () => {
  try {
    console.log('🟠 [Dev] clearStoredSession() called');
    await AsyncStorage.removeItem('currentUser');
    console.log('🟠 [Dev] ✅ Stored session cleared. App will show login screen on next start.');
  } catch (error) {
    console.error('🟠 [Dev] Error clearing session:', error);
  }
};
