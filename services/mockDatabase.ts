

import { User, UserRole, CalendarEvent, Notification, StudentCourse, TeacherCourse, CourseStudent, JustificationRequest, AppTheme, Career, ChatMessage, Classroom, ChatGroup, FinalExamSession, Grade } from '../types';

export interface StoredUser extends User {
  password?: string;
}

const STORAGE_KEY_USERS = 'isfdyt26_users';
const STORAGE_KEY_EVENTS = 'isfdyt26_events';
const STORAGE_KEY_NOTIFICATIONS = 'isfdyt26_notifications';
const STORAGE_KEY_JUSTIFICATIONS = 'isfdyt26_justifications';
const STORAGE_KEY_CAREERS = 'isfdyt26_careers';
const STORAGE_KEY_MESSAGES = 'isfdyt26_messages';
const STORAGE_KEY_GROUPS = 'isfdyt26_groups';
const STORAGE_KEY_CLASSROOMS = 'isfdyt26_classrooms';
const STORAGE_KEY_BLOCKED = 'isfdyt26_blocked';
const STORAGE_KEY_FINALS = 'isfdyt26_finals';

const INITIAL_CAREERS: Career[] = [
  { 
      id: 'c8', 
      name: "Tecnicatura Superior en Desarrollo de Software", 
      years: ["1° Año", "2° Año", "3° Año"], 
      subjects: [
          {id: 's1', name: 'Programación I', year: '1° Año'},
          {id: 's2', name: 'Sistemas Operativos', year: '1° Año'},
          {id: 's3', name: 'Matemática I', year: '1° Año'},
          {id: 's4', name: 'Inglés Técnico I', year: '1° Año'},
          {id: 's5', name: 'Base de Datos', year: '2° Año'},
          {id: 's6', name: 'Práctica Profesionalizante I', year: '1° Año'}
      ] 
  },
  { id: 'c1', name: "Profesorado de Educación Primaria", years: ["1° Año", "2° Año", "3° Año", "4° Año"], subjects: [] },
  { id: 'c2', name: "Profesorado de Educación Especial", years: ["2° Año", "3° Año", "4° Año"], subjects: [] },
  { id: 'c3', name: "Profesorado de Educación Inicial", years: ["1° Año", "2° Año"], subjects: [] },
  { id: 'c6', name: "Tecnicatura Superior en Enfermería", years: ["1° Año", "2° Año", "3° Año"], subjects: [] },
];

const INITIAL_USERS: StoredUser[] = [
  { 
    id: '1', 
    name: 'Alumno Demo', 
    role: UserRole.ALUMNO, 
    email: 'alumno@isfd26.edu.ar', 
    password: '123', 
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AD',
    preferences: { emailNotifications: true, darkMode: false, theme: 'indigo' as AppTheme }
  },
  { 
    id: '2', 
    name: 'Prof. Alejandro Gomez', 
    role: UserRole.DOCENTE, 
    email: 'docente@isfd26.edu.ar', 
    password: '123', 
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AG',
    preferences: { emailNotifications: true, darkMode: false, theme: 'teal' as AppTheme }
  },
  { 
    id: '3', 
    name: 'Laura Quiroga', 
    role: UserRole.PRECEPTOR, 
    email: 'preceptor@isfd26.edu.ar', 
    password: '123', 
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LQ',
    preferences: { emailNotifications: true, darkMode: false, theme: 'rose' as AppTheme }
  },
  { 
    id: '4', 
    name: 'Dir. Esteban Quito', 
    role: UserRole.DIRECTIVO, 
    email: 'directivo@isfd26.edu.ar', 
    password: '123', 
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=EQ',
    preferences: { emailNotifications: true, darkMode: false, theme: 'blue' as AppTheme }
  },
  { 
    id: '5', 
    name: 'Admin Sistema', 
    role: UserRole.ADMIN, 
    email: 'admin@isfd26.edu.ar', 
    password: '123', 
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS',
    preferences: { emailNotifications: true, darkMode: true, theme: 'violet' as AppTheme }
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Inicio Ciclo Lectivo', date: '2024-03-11', type: 'other', description: 'Acto de inicio' },
  { id: '2', title: 'Parcial Programación I', date: '2024-05-20', type: 'exam' },
  { id: '3', title: 'Feriado Nacional', date: '2024-05-25', type: 'holiday' },
  { id: '4', title: 'Entrega TP Final', date: '2024-06-15', type: 'deadline' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', userId: '1', title: 'Nueva Calificación', message: 'Se ha cargado la nota de Parcial Programación.', date: new Date().toISOString(), read: false, type: 'success' },
  { id: '2', userId: 'all', title: 'Mantenimiento del Sistema', message: 'La plataforma estará en mantenimiento el domingo.', date: new Date().toISOString(), read: false, type: 'info' },
  { id: '3', userId: '2', title: 'Recordatorio Planificación', message: 'Recuerde subir la planificación anual antes del viernes.', date: new Date().toISOString(), read: true, type: 'alert' },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'm1', senderId: '2', receiverId: '1', content: 'Hola, recuerda entregar el TP mañana.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
  { id: 'm2', senderId: '1', receiverId: '2', content: 'Si profesor, ya lo estoy terminando.', timestamp: new Date(Date.now() - 82000000).toISOString(), read: true }
];

const INITIAL_GROUPS: ChatGroup[] = [
    { id: 'g1', name: 'Sala de Profesores', members: ['2', '3', '4', '5'], admins: ['4'], avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SP' }
];

const INITIAL_JUSTIFICATIONS: JustificationRequest[] = [
  { 
    id: 'req1', 
    studentId: '2', // random
    studentName: 'Benitez, Clara',
    courseName: 'Programación I',
    date: '2024-05-10',
    reason: 'Consulta médica (Certificado adjunto)',
    status: 'PENDING',
    requestDate: new Date().toISOString()
  }
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'a1', name: 'Aula 204', capacity: 35, location: 'Planta Alta' },
  { id: 'a2', name: 'Laboratorio de Informática', capacity: 25, location: 'Planta Baja' },
  { id: 'a3', name: 'Auditorio', capacity: 100, location: 'Edificio Anexo' }
];

// Internal interface for mock storage of finals
interface StoredFinalExam {
    id: string;
    subjectName: string;
    careerId?: string;
    subjectId?: string;
    date: string;
    time: string;
    professor: string;
    classroom: string;
    registeredStudentIds: string[];
}

const INITIAL_FINALS: StoredFinalExam[] = [
    { id: 'f1', subjectName: 'Programación I', subjectId: 's1', date: '2024-07-10', time: '18:00', professor: 'Prof. A. Gomez', classroom: 'Lab. Informática', registeredStudentIds: [] },
    { id: 'f2', subjectName: 'Sistemas Operativos', subjectId: 's2', date: '2024-07-12', time: '19:00', professor: 'Prof. M. Sanchez', classroom: 'Aula 204', registeredStudentIds: [] },
    { id: 'f3', subjectName: 'Inglés Técnico I', subjectId: 's4', date: '2024-07-15', time: '18:00', professor: 'Prof. S. Connor', classroom: 'Aula 205', registeredStudentIds: ['1'] },
    { id: 'f4', subjectName: 'Matemática I', subjectId: 's3', date: '2024-07-18', time: '18:30', professor: 'Prof. R. Diaz', classroom: 'Aula 202', registeredStudentIds: [] },
];

export const initializeDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEY_EVENTS)) {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(INITIAL_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEY_NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEY_JUSTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEY_JUSTIFICATIONS, JSON.stringify(INITIAL_JUSTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEY_CAREERS)) {
    localStorage.setItem(STORAGE_KEY_CAREERS, JSON.stringify(INITIAL_CAREERS));
  }
  if (!localStorage.getItem(STORAGE_KEY_MESSAGES)) {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEY_GROUPS)) {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(INITIAL_GROUPS));
  }
  if (!localStorage.getItem(STORAGE_KEY_CLASSROOMS)) {
    localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(INITIAL_CLASSROOMS));
  }
  if (!localStorage.getItem(STORAGE_KEY_BLOCKED)) {
      localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_KEY_FINALS)) {
      localStorage.setItem(STORAGE_KEY_FINALS, JSON.stringify(INITIAL_FINALS));
  }
};

// ... [Previous Classroom, Career, User, Events, Notifications, Chat Logic] ...
// (Keeping these sections to save space, but assuming they are present as before)

// --- Classrooms ---
export const getClassrooms = (): Classroom[] => {
    const data = localStorage.getItem(STORAGE_KEY_CLASSROOMS);
    return data ? JSON.parse(data) : INITIAL_CLASSROOMS;
};

export const saveClassroom = (classroom: Classroom) => {
    const classrooms = getClassrooms();
    const existingIndex = classrooms.findIndex(c => c.id === classroom.id);
    if (existingIndex >= 0) {
        classrooms[existingIndex] = classroom;
    } else {
        classrooms.push(classroom);
    }
    localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(classrooms));
    return classroom;
};

export const deleteClassroom = (id: string) => {
    const classrooms = getClassrooms().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(classrooms));
};

// --- Careers ---
export const getCareers = (): Career[] => {
  const data = localStorage.getItem(STORAGE_KEY_CAREERS);
  return data ? JSON.parse(data) : INITIAL_CAREERS;
};

export const saveCareer = (career: Career) => {
    const careers = getCareers();
    const existingIndex = careers.findIndex(c => c.id === career.id);
    if (existingIndex >= 0) {
        careers[existingIndex] = career;
    } else {
        careers.push(career);
    }
    localStorage.setItem(STORAGE_KEY_CAREERS, JSON.stringify(careers));
    return career;
};

export const deleteCareer = (id: string) => {
    const careers = getCareers().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CAREERS, JSON.stringify(careers));
};

// --- Users ---
export const getUsers = (): StoredUser[] => {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : INITIAL_USERS;
};

export const getUserById = (id: string): StoredUser | undefined => {
    const users = getUsers();
    return users.find(u => u.id === id);
}

export const addUser = (user: Omit<StoredUser, 'id'>) => {
  const users = getUsers();
  const newUser: StoredUser = { 
      ...user, 
      id: Date.now().toString(),
      preferences: { emailNotifications: true, darkMode: false, theme: 'indigo' as AppTheme }
  };
  if (!newUser.avatar) {
    newUser.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newUser.name)}`;
  }
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<StoredUser>) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        const { password, ...safeUser } = users[index];
        return safeUser;
    }
    return null;
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
  return null;
};

// --- Events ---
export const getEvents = (): CalendarEvent[] => {
  const data = localStorage.getItem(STORAGE_KEY_EVENTS);
  return data ? JSON.parse(data) : INITIAL_EVENTS;
};

export const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
  const events = getEvents();
  const newEvent = { ...event, id: Date.now().toString() };
  events.push(newEvent);
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  return newEvent;
};

export const deleteEvent = (id: string) => {
    const events = getEvents().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
};

// --- Notifications ---
export const getNotifications = (userId: string): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    const all: Notification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    return all.filter(n => n.userId === userId || n.userId === 'all').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getUnreadCount = (userId: string): number => {
    const notifs = getNotifications(userId);
    return notifs.filter(n => !n.read).length;
};

export const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
  const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  const all: Notification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    read: false
  };
  all.push(newNotification);
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
  return newNotification;
};

export const markNotificationAsRead = (id: string) => {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    let all: Notification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    all = all.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
};

export const markAllNotificationsAsRead = (userId: string) => {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    let all: Notification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    all = all.map(n => (n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
};

export const deleteNotification = (id: string) => {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    let all: Notification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    all = all.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
};

// --- Chat Logic (Groups, Messages, Block) ---
export const getGroups = (userId: string): ChatGroup[] => {
    const data = localStorage.getItem(STORAGE_KEY_GROUPS);
    const all: ChatGroup[] = data ? JSON.parse(data) : INITIAL_GROUPS;
    return all.filter(g => g.members.includes(userId));
};

export const createGroup = (name: string, memberIds: string[], adminId: string): ChatGroup => {
    const data = localStorage.getItem(STORAGE_KEY_GROUPS);
    const all: ChatGroup[] = data ? JSON.parse(data) : INITIAL_GROUPS;
    const newGroup: ChatGroup = {
        id: `g${Date.now()}`,
        name,
        members: [...memberIds, adminId],
        admins: [adminId],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    };
    all.push(newGroup);
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(all));
    return newGroup;
};

export const leaveGroup = (userId: string, groupId: string) => {
    const data = localStorage.getItem(STORAGE_KEY_GROUPS);
    let all: ChatGroup[] = data ? JSON.parse(data) : INITIAL_GROUPS;
    const groupIndex = all.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
        const group = all[groupIndex];
        group.members = group.members.filter(id => id !== userId);
        if (group.members.length === 0) {
            all.splice(groupIndex, 1); 
        } else {
            if (group.admins.includes(userId)) {
                group.admins = group.admins.filter(id => id !== userId);
                if (group.admins.length === 0 && group.members.length > 0) {
                    group.admins.push(group.members[0]);
                }
            }
            all[groupIndex] = group;
        }
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(all));
    }
};

export const updateGroupAvatar = (groupId: string, base64: string) => {
    const data = localStorage.getItem(STORAGE_KEY_GROUPS);
    let all: ChatGroup[] = data ? JSON.parse(data) : INITIAL_GROUPS;
    const group = all.find(g => g.id === groupId);
    if (group) {
        group.avatar = base64;
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(all));
    }
};

export const getMessages = (userId: string, otherId: string, isGroup: boolean = false): ChatMessage[] => {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const all: ChatMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
    if (isGroup) {
        return all.filter(m => m.groupId === otherId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
        return all.filter(m => !m.groupId && ((m.senderId === userId && m.receiverId === otherId) || (m.senderId === otherId && m.receiverId === userId))).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
};

export const sendMessage = (senderId: string, receiverId: string, content: string) => {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const all: ChatMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
    const newMessage: ChatMessage = { id: Date.now().toString(), senderId, receiverId, content, timestamp: new Date().toISOString(), read: false };
    all.push(newMessage);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(all));
    return newMessage;
};

export const sendGroupMessage = (senderId: string, groupId: string, content: string) => {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const all: ChatMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
    const newMessage: ChatMessage = { id: Date.now().toString(), senderId, receiverId: groupId, groupId: groupId, content, timestamp: new Date().toISOString(), read: false };
    all.push(newMessage);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(all));
    return newMessage;
};

export const markMessagesAsRead = (userId: string, senderId: string) => {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    let all: ChatMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
    all = all.map(m => (!m.groupId && m.receiverId === userId && m.senderId === senderId) ? { ...m, read: true } : m);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(all));
};

export const clearChat = (userId: string, otherId: string) => {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    let all: ChatMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
    const isGroup = otherId.startsWith('g'); 
    if (isGroup) {
        all = all.filter(m => m.groupId !== otherId);
    } else {
        all = all.filter(m => !((m.senderId === userId && m.receiverId === otherId) || (m.senderId === otherId && m.receiverId === userId)));
    }
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(all));
};

export const getUnreadMessagesCount = (userId: string): number => {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const all: ChatMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
    return all.filter(m => m.receiverId === userId && !m.read && !m.groupId).length;
};

export const toggleBlockUser = (userId: string, targetId: string) => {
    const data = localStorage.getItem(STORAGE_KEY_BLOCKED);
    const blockedMap: Record<string, string[]> = data ? JSON.parse(data) : {};
    const userBlocks = blockedMap[userId] || [];
    const isBlocked = userBlocks.includes(targetId);
    if (isBlocked) {
        blockedMap[userId] = userBlocks.filter(id => id !== targetId);
    } else {
        blockedMap[userId] = [...userBlocks, targetId];
    }
    localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(blockedMap));
    return !isBlocked;
};

export const isUserBlocked = (userId: string, targetId: string): boolean => {
    const data = localStorage.getItem(STORAGE_KEY_BLOCKED);
    const blockedMap: Record<string, string[]> = data ? JSON.parse(data) : {};
    return (blockedMap[userId] || []).includes(targetId);
};

export const getContacts = (currentUserId: string): (User & { unread: number, lastMessage?: string, isBlocked: boolean })[] => {
    const users = getUsers().filter(u => u.id !== currentUserId);
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const allMessages: ChatMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
    return users.map(u => {
        const messages = allMessages.filter(m => !m.groupId && ((m.senderId === currentUserId && m.receiverId === u.id) || (m.senderId === u.id && m.receiverId === currentUserId))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const unread = allMessages.filter(m => m.senderId === u.id && m.receiverId === currentUserId && !m.read && !m.groupId).length;
        const isBlocked = isUserBlocked(currentUserId, u.id);
        return { ...u, unread, lastMessage: messages.length > 0 ? messages[0].content : undefined, isBlocked };
    });
};

// --- Justifications ---
export const getJustificationRequests = (): JustificationRequest[] => {
  const data = localStorage.getItem(STORAGE_KEY_JUSTIFICATIONS);
  return data ? JSON.parse(data) : INITIAL_JUSTIFICATIONS;
};

export const addJustificationRequest = (req: Omit<JustificationRequest, 'id' | 'status' | 'requestDate'>) => {
  const reqs = getJustificationRequests();
  const newReq: JustificationRequest = { ...req, id: Date.now().toString(), status: 'PENDING', requestDate: new Date().toISOString() };
  reqs.push(newReq);
  localStorage.setItem(STORAGE_KEY_JUSTIFICATIONS, JSON.stringify(reqs));
  return newReq;
};

export const updateJustificationStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
  const reqs = getJustificationRequests();
  const updatedReqs = reqs.map(r => r.id === id ? { ...r, status } : r);
  localStorage.setItem(STORAGE_KEY_JUSTIFICATIONS, JSON.stringify(updatedReqs));
  return updatedReqs;
};

// --- Mock Data for Student Courses with Academic Status ---
export const getStudentCourses = (studentId: string): StudentCourse[] => {
    // We are hardcoding statuses for the demo user to show the restriction logic
    // In a real app, this would be fetched from a database based on student records
    return [
        {
            id: 'prog1',
            name: 'Programación I',
            professor: 'Prof. Alejandro Gomez',
            schedule: 'Lun 18:00 - 22:00',
            attendance: 92,
            nextExams: [{ date: '2024-06-10', title: 'Parcial Estructuras de Control' }],
            resources: [
                { id: 'r1', title: 'Introducción a Algoritmos', type: 'pdf', url: '#', date: '2024-03-15' },
                { id: 'r2', title: 'Clase Grabada: Variables y Tipos', type: 'video', url: '#', date: '2024-03-20' }
            ],
            academicStatus: 'Cursada Aprobada' // Eligible for final
        },
        {
            id: 'sis1',
            name: 'Sistemas Operativos',
            professor: 'Prof. Maria Sanchez',
            schedule: 'Mar 18:00 - 20:00',
            attendance: 85,
            nextExams: [],
            resources: [],
            academicStatus: 'Cursando' // Not eligible yet
        },
        {
            id: 'mat1',
            name: 'Matemática I',
            professor: 'Prof. Roberto Diaz',
            schedule: 'Mie 18:00 - 20:00',
            attendance: 100,
            nextExams: [],
            resources: [],
            academicStatus: 'Cursando'
        },
        {
            id: 'ing1',
            name: 'Inglés Técnico I',
            professor: 'Prof. Sarah Connor',
            schedule: 'Jue 18:00 - 20:00',
            attendance: 70,
            nextExams: [],
            resources: [],
            academicStatus: 'Cursada Aprobada' // Eligible
        }
    ];
};

// --- Mock Data for Teacher Courses ---
let teacherCoursesMock: TeacherCourse[] = [
    {
        id: 'soft1-prog1',
        name: 'Programación I',
        career: 'Tec. Sup. en Desarrollo de Software',
        year: '1° Año',
        schedule: 'Lun 18:00 - 22:00',
        totalStudents: 32,
        nextClass: 'Hoy 18:00',
        status: 'active'
    },
    {
        id: 'soft2-bd',
        name: 'Base de Datos',
        career: 'Tec. Sup. en Desarrollo de Software',
        year: '2° Año',
        schedule: 'Mar 19:00 - 21:00',
        totalStudents: 25,
        nextClass: 'Mañana 19:00',
        status: 'active'
    },
    {
        id: 'enf3-prac',
        name: 'Práctica Profesional',
        career: 'Tec. Sup. en Enfermería',
        year: '3° Año',
        schedule: 'Vie 08:00 - 12:00',
        totalStudents: 18,
        nextClass: 'Vie 08:00',
        status: 'active'
    },
    {
        id: 'archived-1',
        name: 'Introducción a la Programación (2023)',
        career: 'Tec. Sup. en Desarrollo de Software',
        year: '1° Año',
        schedule: 'Finalizado',
        totalStudents: 28,
        nextClass: '-',
        status: 'archived'
    }
];

export const getTeacherCourses = (teacherId: string): TeacherCourse[] => {
    return teacherCoursesMock;
};

export const toggleCourseStatus = (courseId: string) => {
    teacherCoursesMock = teacherCoursesMock.map(course => 
        course.id === courseId 
            ? { ...course, status: course.status === 'active' ? 'archived' : 'active' }
            : course
    );
    return teacherCoursesMock;
};

export const getCourseStudents = (courseId: string): CourseStudent[] => {
    // Mock generation
    const count = courseId === 'soft1-prog1' ? 12 : courseId === 'soft2-bd' ? 8 : 6; 
    const students: CourseStudent[] = [];
    const names = ['Alvarez', 'Benitez', 'Castro', 'Dominguez', 'Fernandez', 'Gomez', 'Lopez', 'Martinez', 'Perez', 'Rodriguez', 'Sanchez', 'Torres'];
    const firstNames = ['Juan', 'Maria', 'Pedro', 'Ana', 'Luis', 'Sofia', 'Carlos', 'Lucia', 'Miguel', 'Elena'];
    for(let i=0; i<count; i++) {
        const mockGrades: Grade[] = [
             { id: `g1-${i}`, title: 'TP 1', value: Math.floor(Math.random() * 4) + 6, date: '2024-04-10' },
             { id: `g2-${i}`, title: 'Parcial 1', value: Math.floor(Math.random() * 4) + 6, date: '2024-05-15' }
        ];

        students.push({
            id: `st-${courseId}-${i}`,
            name: `${names[i % names.length]}, ${firstNames[i % firstNames.length]}`,
            attendance: 70 + Math.floor(Math.random() * 30),
            lastGrade: mockGrades[mockGrades.length - 1].value,
            grades: mockGrades
        });
    }
    return students;
};

// --- Final Exams Logic ---

export const getFinalExams = (userId: string): FinalExamSession[] => {
    const data = localStorage.getItem(STORAGE_KEY_FINALS);
    const finals: StoredFinalExam[] = data ? JSON.parse(data) : INITIAL_FINALS;
    
    return finals.map(f => ({
        id: f.id,
        subjectName: f.subjectName,
        subjectId: f.subjectId,
        careerId: f.careerId,
        date: f.date,
        time: f.time,
        professor: f.professor,
        classroom: f.classroom,
        isRegistered: f.registeredStudentIds.includes(userId),
        registeredCount: f.registeredStudentIds.length
    }));
};

export const addFinalExam = (exam: Omit<StoredFinalExam, 'id' | 'registeredStudentIds'>) => {
    const data = localStorage.getItem(STORAGE_KEY_FINALS);
    const finals: StoredFinalExam[] = data ? JSON.parse(data) : INITIAL_FINALS;
    
    const newExam: StoredFinalExam = {
        ...exam,
        id: Date.now().toString(),
        registeredStudentIds: []
    };
    
    finals.push(newExam);
    localStorage.setItem(STORAGE_KEY_FINALS, JSON.stringify(finals));
    return newExam;
};

export const deleteFinalExam = (id: string) => {
    const data = localStorage.getItem(STORAGE_KEY_FINALS);
    let finals: StoredFinalExam[] = data ? JSON.parse(data) : INITIAL_FINALS;
    finals = finals.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY_FINALS, JSON.stringify(finals));
};

export const toggleFinalRegistration = (userId: string, examId: string): boolean => {
    const data = localStorage.getItem(STORAGE_KEY_FINALS);
    const finals: StoredFinalExam[] = data ? JSON.parse(data) : INITIAL_FINALS;
    
    const examIndex = finals.findIndex(f => f.id === examId);
    if (examIndex !== -1) {
        const exam = finals[examIndex];
        const isRegistered = exam.registeredStudentIds.includes(userId);
        
        if (isRegistered) {
            exam.registeredStudentIds = exam.registeredStudentIds.filter(id => id !== userId);
        } else {
            exam.registeredStudentIds.push(userId);
        }
        
        finals[examIndex] = exam;
        localStorage.setItem(STORAGE_KEY_FINALS, JSON.stringify(finals));
        return !isRegistered;
    }
    return false;
};