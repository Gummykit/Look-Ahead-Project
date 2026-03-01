// Type definitions for the Construction Timechart App

export interface NonWorkingDay {
  id: string;
  date: Date;
  name: string;
  color?: string;
}

// Maintain backward compatibility
export type PublicHoliday = NonWorkingDay;

export interface Subcontractor {
  id: string;
  name: string;
  isActive: boolean;
}

export interface FloorLevel {
  id: string;
  name: string;
  levelNumber: number;
  color: string;
}

export interface Activity {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  subcontractorId: string;
  subcontractorName: string;
  floorLevelId: string;
  floorLevelName: string;
  floorLevelColor: string;
  description?: string;
  sequenceOrder: number;
  isStarted?: boolean; // Marks activity as started with a small green tick
  isCompleted?: boolean; // Marks activity as complete with strikethrough
  parentActivityId?: string; // ID of parent activity if this is a child activity
  childActivityIds?: string[]; // Array of child activity IDs
  childDuration?: number; // Duration of child activity in days
  childActivityName?: string; // Name of child activity (temporary, used during creation)
}

export interface DailyActivityLog {
  id: string;
  activityId: string;
  date: Date;
  notes: string;
  imageUris: string[]; // Array of image URIs
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeChartData {
  id: string;
  projectName: string;
  projectDescription?: string;
  companyName: string;
  companyLogoUri?: string;
  projectLocation: string;
  startDate: Date;
  endDate: Date;
  nonWorkingDays: NonWorkingDay[];
  publicHolidays?: PublicHoliday[]; // Deprecated, kept for backward compatibility
  subcontractors: Subcontractor[];
  floorLevels: FloorLevel[];
  activities: Activity[];
  dailyActivityLogs: DailyActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDetailModalData {
  activity?: Activity;
  subcontractors: Subcontractor[];
  isVisible: boolean;
}

// ============ USER & AUTHENTICATION TYPES ============

export type UserRole = 'contractor' | 'sub-contractor' | 'observer';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In production, this should be hashed
  role: UserRole;
  fullName: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthContext {
  user: User | null;
  isLoggedIn: boolean;
  isLoading?: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, email: string, password: string, role: UserRole, fullName: string) => Promise<void>;
}

export interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAddActivity: boolean;
  canEditActivity: boolean;
  canDeleteActivity: boolean;
  canAddHoliday: boolean;
  canDeleteHoliday: boolean;
  canAddSubcontractor: boolean;
  canDeleteSubcontractor: boolean;
  canViewTimechart: boolean;
  canLogDailyActivity: boolean;
  canMarkActivityStarted: boolean;
  canMarkActivityComplete: boolean;
}

export interface ChartConfig {
  weekWidth: number;
  dayWidth: number;
  rowHeight: number;
  headerHeight: number;
}
