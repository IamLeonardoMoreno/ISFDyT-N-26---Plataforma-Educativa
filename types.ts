
export enum UserRole {
  ALUMNO = 'ALUMNO',
  DOCENTE = 'DOCENTE',
  PRECEPTOR = 'PRECEPTOR',
  DIRECTIVO = 'DIRECTIVO',
  ADMIN = 'ADMIN'
}

export type AppTheme = 'indigo' | 'teal' | 'blue' | 'rose' | 'violet' | 'amber';

export interface UserPreferences {
  emailNotifications: boolean;
  darkMode: boolean;
  theme: AppTheme;
}

export interface AcademicAssignment {
  id: string;
  career: string;
  year: string;
  subject?: string; // Materia específica
}

export interface Subject {
  id: string;
  name: string;
  year: string;
}

export interface Career {
  id: string;
  name: string;
  years: string[];
  subjects: Subject[];
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  location: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  phone?: string; // Nuevo campo
  address?: string; // Nuevo campo
  preferences?: UserPreferences;
  academicData?: {
    assignments: AcademicAssignment[];
  };
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  attendance: number; // percentage
  status: 'Regular' | 'Riesgo' | 'Libre';
}

export interface Course {
  id: string;
  name: string;
  schedule: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string YYYY-MM-DD
  type: 'exam' | 'holiday' | 'deadline' | 'meeting' | 'other';
  description?: string;
}

export interface Notification {
  id: string;
  userId: string; // 'all' or specific user ID
  title: string;
  message: string;
  date: string; // ISO Date
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface ChatGroup {
  id: string;
  name: string;
  members: string[]; // User IDs
  admins: string[]; // User IDs
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string; // Can be userId or groupId depending on context logic (usually separate groupId is cleaner)
  groupId?: string; // Optional, if present it is a group message
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'doc';
  url: string;
  date: string;
}

export interface StudentCourse {
  id: string;
  name: string;
  professor: string;
  schedule: string;
  attendance: number;
  nextExams: { date: string; title: string }[];
  resources: Resource[];
  academicStatus: 'Cursada Aprobada' | 'Cursando' | 'Libre' | 'Promocionado'; // Status for final exams eligibility
}

export interface TeacherCourse {
  id: string;
  name: string;
  career: string;
  year: string;
  schedule: string;
  totalStudents: number;
  nextClass: string;
  status: 'active' | 'archived';
}

export interface Grade {
  id: string;
  title: string;
  value: number;
  date: string;
}

export interface CourseStudent {
  id: string;
  name: string;
  attendance: number;
  lastGrade: number;
  grades: Grade[];
}

export interface JustificationRequest {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}

export interface FinalExamSession {
  id: string;
  careerId?: string;
  subjectId?: string;
  subjectName: string;
  date: string;
  time: string;
  professor: string;
  tribunal?: string; // Members of the exam tribunal
  classroom: string;
  isRegistered: boolean; // If the current user is registered
  registeredCount: number; // Just for display
}