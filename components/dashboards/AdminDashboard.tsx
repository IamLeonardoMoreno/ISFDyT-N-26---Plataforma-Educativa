
import React, { useState, useEffect } from 'react';
import { Settings, UserPlus, Trash2, Shield, Mail, Lock, X, Save, Edit, Plus, Minus, BookOpen, GraduationCap, Layers, MapPin, ChevronRight, Search } from 'lucide-react';
import { UserRole, AcademicAssignment, Career, Subject, Classroom } from '../../types';
import { getUsers, addUser, updateUser, deleteUser, StoredUser, getCareers, saveCareer, deleteCareer, getClassrooms, saveClassroom, deleteClassroom } from '../../services/mockDatabase';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'careers' | 'subjects' | 'classrooms'>('users');
  
  // Users State
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Careers State
  const [careers, setCareers] = useState<Career[]>([]);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  
  // Classrooms State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  
  // Subjects State (New Dedicated Tab)
  const [selectedCareerIdForSubjects, setSelectedCareerIdForSubjects] = useState<string>('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectYear, setNewSubjectYear] = useState('');

  // User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.ALUMNO);
  
  // Assignments State (Academic Data)
  const [assignments, setAssignments] = useState<AcademicAssignment[]>([]);

  // Career Form State
  const [editingCareerId, setEditingCareerId] = useState<string | null>(null);
  const [careerName, setCareerName] = useState('');
  const [careerYears, setCareerYears] = useState<string[]>([]);

  // Classroom Form State
  const [editingClassroomId, setEditingClassroomId] = useState<string | null>(null);
  const [classroomName, setClassroomName] = useState('');
  const [classroomCapacity, setClassroomCapacity] = useState<number>(30);
  const [classroomLocation, setClassroomLocation] = useState('');

  useEffect(() => {
    refreshUsers();
    refreshCareers();
    refreshClassrooms();
  }, []);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const refreshCareers = () => {
      setCareers(getCareers());
  };

  const refreshClassrooms = () => {
      setClassrooms(getClassrooms());
  };

  // --- User Management Functions ---

  const handleDeleteUser = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      deleteUser(id);
      refreshUsers();
    }
  };

  const openUserModal = (user?: StoredUser) => {
      if (user) {
          setEditingUserId(user.id);
          setNewName(user.name);
          setNewEmail(user.email);
          setNewPassword(user.password || '');
          setNewRole(user.role);
          setAssignments(user.academicData?.assignments || []);
      } else {
          setEditingUserId(null);
          setNewName('');
          setNewEmail('');
          setNewPassword('');
          setNewRole(UserRole.ALUMNO);
          setAssignments([]);
      }
      setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = {
        name: newName,
        email: newEmail,
        role: newRole,
        academicData: { assignments }
    };

    if (editingUserId) {
        const updates: any = { ...userData };
        if (newPassword) updates.password = newPassword;
        updateUser(editingUserId, updates);
    } else {
        addUser({
            ...userData,
            password: newPassword || '123456',
            avatar: '',
        });
    }
    
    setIsUserModalOpen(false);
    refreshUsers();
  };

  // Assignment Logic
  const addAssignment = () => {
      if (careers.length === 0) return;
      const firstCareer = careers[0];
      setAssignments([
          ...assignments, 
          { 
              id: Date.now().toString(), 
              career: firstCareer.name, 
              year: firstCareer.years[0] || '', 
              subject: '' 
          }
      ]);
  };

  const removeAssignment = (id: string) => {
      setAssignments(assignments.filter(a => a.id !== id));
  };

  const updateAssignment = (id: string, field: keyof AcademicAssignment, value: string) => {
      setAssignments(assignments.map(a => {
          if (a.id === id) {
              const updated = { ...a, [field]: value };
              // Update years and clear subject if career changes
              if (field === 'career') {
                  const selectedCareer = careers.find(c => c.name === value);
                  updated.year = selectedCareer?.years[0] || '';
                  updated.subject = '';
              }
              // Clear subject if year changes
              if (field === 'year') {
                  updated.subject = '';
              }
              return updated;
          }
          return a;
      }));
  };

  // --- Career Management Functions ---

  const openCareerModal = (career?: Career) => {
      if (career) {
          setEditingCareerId(career.id);
          setCareerName(career.name);
          setCareerYears([...career.years]);
      } else {
          setEditingCareerId(null);
          setCareerName('');
          setCareerYears(['1° Año']);
      }
      setIsCareerModalOpen(true);
  };

  const handleDeleteCareer = (id: string) => {
      if (window.confirm('¿Estás seguro de eliminar esta carrera? Esto podría afectar a los usuarios asignados.')) {
          deleteCareer(id);
          refreshCareers();
      }
  };

  const handleAddYear = () => {
      setCareerYears([...careerYears, `${careerYears.length + 1}° Año`]);
  };

  const handleRemoveYear = (index: number) => {
      const newYears = [...careerYears];
      newYears.splice(index, 1);
      setCareerYears(newYears);
  };

  const handleYearChange = (index: number, value: string) => {
      const newYears = [...careerYears];
      newYears[index] = value;
      setCareerYears(newYears);
  };

  const handleSaveCareer = (e: React.FormEvent) => {
      e.preventDefault();
      if (!careerName || careerYears.length === 0) {
          alert("Debes ingresar un nombre y al menos un año.");
          return;
      }

      const currentCareer = editingCareerId ? careers.find(c => c.id === editingCareerId) : null;

      saveCareer({
          id: editingCareerId || Date.now().toString(),
          name: careerName,
          years: careerYears,
          subjects: currentCareer?.subjects || [] // Preserve existing subjects if editing
      });

      setIsCareerModalOpen(false);
      refreshCareers();
  };

  // --- Subject Management Functions ---

  const handleAddSubject = () => {
    if (!selectedCareerIdForSubjects || !newSubjectName || !newSubjectYear) return;

    const career = careers.find(c => c.id === selectedCareerIdForSubjects);
    if (!career) return;

    const newSubject: Subject = {
        id: Date.now().toString(),
        name: newSubjectName,
        year: newSubjectYear
    };

    const updatedSubjects = [...(career.subjects || []), newSubject];
    const updatedCareer = { ...career, subjects: updatedSubjects };
    
    saveCareer(updatedCareer); 
    refreshCareers();
    setNewSubjectName('');
  };

  const handleDeleteSubject = (subjectId: string) => {
    const career = careers.find(c => c.id === selectedCareerIdForSubjects);
    if (!career) return;
    
    const updatedSubjects = career.subjects.filter(s => s.id !== subjectId);
    const updatedCareer = { ...career, subjects: updatedSubjects };
    
    saveCareer(updatedCareer);
    refreshCareers();
  };

  // --- Classroom Management Functions ---

  const openClassroomModal = (classroom?: Classroom) => {
      if (classroom) {
          setEditingClassroomId(classroom.id);
          setClassroomName(classroom.name);
          setClassroomCapacity(classroom.capacity);
          setClassroomLocation(classroom.location);
      } else {
          setEditingClassroomId(null);
          setClassroomName('');
          setClassroomCapacity(30);
          setClassroomLocation('');
      }
      setIsClassroomModalOpen(true);
  };

  const handleDeleteClassroom = (id: string) => {
      if (window.confirm('¿Eliminar este aula?')) {
          deleteClassroom(id);
          refreshClassrooms();
      }
  };

  const handleSaveClassroom = (e: React.FormEvent) => {
      e.preventDefault();
      saveClassroom({
          id: editingClassroomId || Date.now().toString(),
          name: classroomName,
          capacity: classroomCapacity,
          location: classroomLocation
      });
      setIsClassroomModalOpen(false);
      refreshClassrooms();
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-gray-600" /> Administración del Sistema
          </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-2 pt-2 overflow-x-auto">
          <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg flex items-center transition whitespace-nowrap ${activeTab === 'users' ? 'bg-gray-50 text-blue-600 border-t border-x border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <UserPlus className="w-4 h-4 mr-2" /> Gestión de Usuarios
          </button>
          <button 
              onClick={() => setActiveTab('careers')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg flex items-center transition whitespace-nowrap ${activeTab === 'careers' ? 'bg-gray-50 text-blue-600 border-t border-x border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <GraduationCap className="w-4 h-4 mr-2" /> Gestión de Carreras
          </button>
          <button 
              onClick={() => setActiveTab('subjects')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg flex items-center transition whitespace-nowrap ${activeTab === 'subjects' ? 'bg-gray-50 text-blue-600 border-t border-x border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <BookOpen className="w-4 h-4 mr-2" /> Gestión de Materias
          </button>
          <button 
              onClick={() => setActiveTab('classrooms')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg flex items-center transition whitespace-nowrap ${activeTab === 'classrooms' ? 'bg-gray-50 text-blue-600 border-t border-x border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <MapPin className="w-4 h-4 mr-2" /> Gestión de Aulas
          </button>
      </div>

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 overflow-hidden mt-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700">Usuarios Registrados</h3>
                <button 
                    onClick={() => openUserModal()}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-blue-700 transition"
                >
                    <UserPlus className="w-4 h-4 mr-1.5" /> Nuevo Usuario
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignaciones</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                    <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <img className="h-8 w-8 rounded-full mr-3" src={user.avatar} alt="" />
                                <span className="font-medium text-gray-900">{user.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'DOCENTE' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                            {user.academicData?.assignments && user.academicData.assignments.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {user.academicData.assignments.slice(0, 2).map((a, idx) => (
                                        <span key={idx} className="inline-block truncate max-w-[150px]">
                                            {a.subject ? `${a.subject} (${a.year})` : `${a.career} - ${a.year}`}
                                        </span>
                                    ))}
                                    {user.academicData.assignments.length > 2 && <span className="text-gray-400">+{user.academicData.assignments.length - 2} más...</span>}
                                </div>
                            ) : (
                                <span className="text-gray-300 italic">Sin asignaciones</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button 
                                onClick={() => openUserModal(user)}
                                className="text-indigo-600 hover:text-indigo-900 inline-block"
                            >
                                <Edit className="w-4 h-4"/>
                            </button>
                            {user.role !== UserRole.ADMIN && (
                                <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900 inline-block"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      )}

      {/* --- CAREERS TAB --- */}
      {activeTab === 'careers' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 overflow-hidden mt-0">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700">Carreras y Años</h3>
                <button 
                    onClick={() => openCareerModal()}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> Nueva Carrera
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de la Carrera</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Años/Cursos</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Materias</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {careers.map((career) => (
                            <tr key={career.id}>
                                <td className="px-6 py-4 font-medium text-gray-900">{career.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-1">
                                        {career.years.map((year, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs border border-gray-200">{year}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                     <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
                                        {career.subjects ? career.subjects.length : 0}
                                     </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => openCareerModal(career)}
                                        className="text-indigo-600 hover:text-indigo-900 inline-block p-1.5"
                                        title="Editar Carrera"
                                    >
                                        <Edit className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCareer(career.id)}
                                        className="text-red-600 hover:text-red-900 inline-block p-1.5"
                                        title="Eliminar Carrera"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {/* --- SUBJECTS TAB --- */}
      {activeTab === 'subjects' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 overflow-hidden mt-0">
               <div className="p-6">
                   <div className="mb-6">
                       <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Carrera para gestionar materias</label>
                       <div className="relative">
                           <BookOpen className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                           <select 
                                className="w-full border border-gray-300 bg-white rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 font-medium shadow-sm"
                                value={selectedCareerIdForSubjects}
                                onChange={(e) => {
                                    setSelectedCareerIdForSubjects(e.target.value);
                                    // Reset form when career changes
                                    const career = careers.find(c => c.id === e.target.value);
                                    if (career && career.years.length > 0) {
                                        setNewSubjectYear(career.years[0]);
                                    }
                                    setNewSubjectName('');
                                }}
                           >
                               <option value="">-- Seleccione una carrera --</option>
                               {careers.map(c => (
                                   <option key={c.id} value={c.id}>{c.name}</option>
                               ))}
                           </select>
                       </div>
                   </div>

                   {selectedCareerIdForSubjects ? (
                       <div className="animate-fadeIn space-y-6">
                            {/* Add Subject Form */}
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Agregar Nueva Materia
                                </h4>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="md:w-1/4">
                                        <select 
                                            className="w-full border border-indigo-200 bg-white rounded-lg px-3 py-2 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={newSubjectYear}
                                            onChange={(e) => setNewSubjectYear(e.target.value)}
                                        >
                                            {careers.find(c => c.id === selectedCareerIdForSubjects)?.years.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            placeholder="Nombre de la materia"
                                            className="w-full border border-indigo-200 bg-white rounded-lg px-3 py-2 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                                            value={newSubjectName}
                                            onChange={(e) => setNewSubjectName(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleAddSubject}
                                        disabled={!newSubjectName}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>

                            {/* List by Year */}
                            <div className="space-y-4">
                                {careers.find(c => c.id === selectedCareerIdForSubjects)?.years.map(year => {
                                    const career = careers.find(c => c.id === selectedCareerIdForSubjects);
                                    const subjectsInYear = career?.subjects.filter(s => s.year === year) || [];
                                    
                                    return (
                                        <div key={year} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                                                <span className="font-semibold text-gray-700 text-sm">{year}</span>
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{subjectsInYear.length} materias</span>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {subjectsInYear.length > 0 ? (
                                                    subjectsInYear.map(subject => (
                                                        <div key={subject.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition">
                                                            <span className="text-sm text-gray-800 font-medium">{subject.name}</span>
                                                            <button 
                                                                onClick={() => handleDeleteSubject(subject.id)}
                                                                className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition"
                                                                title="Eliminar materia"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-gray-400 italic bg-gray-50/30">
                                                        No hay materias cargadas para este año.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                       </div>
                   ) : (
                       <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                           <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
                               <BookOpen className="w-8 h-8 text-gray-400" />
                           </div>
                           <h3 className="text-lg font-medium text-gray-700">Gestión de Plan de Estudios</h3>
                           <p className="text-gray-500">Selecciona una carrera arriba para ver y editar sus materias.</p>
                       </div>
                   )}
               </div>
          </div>
      )}

      {/* --- CLASSROOMS TAB --- */}
      {activeTab === 'classrooms' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 overflow-hidden mt-0">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700">Aulas y Espacios</h3>
                <button 
                    onClick={() => openClassroomModal()}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> Nueva Aula
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Aula</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad (Personas)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {classrooms.map((classroom) => (
                            <tr key={classroom.id}>
                                <td className="px-6 py-4 font-medium text-gray-900">{classroom.name}</td>
                                <td className="px-6 py-4 text-center text-sm text-gray-600">{classroom.capacity}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                        {classroom.location}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => openClassroomModal(classroom)}
                                        className="text-indigo-600 hover:text-indigo-900 inline-block p-1.5"
                                        title="Editar Aula"
                                    >
                                        <Edit className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClassroom(classroom.id)}
                                        className="text-red-600 hover:text-red-900 inline-block p-1.5"
                                        title="Eliminar Aula"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {classrooms.length === 0 && (
                             <tr>
                                 <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                     No hay aulas registradas.
                                 </td>
                             </tr>
                         )}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {/* Create/Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">{editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input 
                      type="text" required
                      className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white font-medium placeholder-gray-400"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                        type="email" required
                        className="w-full border border-gray-600 bg-gray-700 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white font-medium placeholder-gray-400"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="juan@instituto.edu"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {editingUserId ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                    </label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                        type="text" 
                        required={!editingUserId}
                        className="w-full border border-gray-600 bg-gray-700 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white font-medium placeholder-gray-400"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Ej. Clave123"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol Asignado</label>
                    <select 
                      className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as UserRole)}
                    >
                      {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
              </div>

              {/* Assignments Section */}
              {(newRole === UserRole.ALUMNO || newRole === UserRole.DOCENTE || newRole === UserRole.PRECEPTOR) && (
                  <div className="border-t border-gray-200 pt-6">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-gray-700 flex items-center">
                              <BookOpen className="w-4 h-4 mr-2" /> 
                              {newRole === UserRole.ALUMNO ? 'Inscripción a Materias' : 'Cursos a Cargo'}
                          </h4>
                          <button 
                            type="button"
                            onClick={addAssignment}
                            disabled={careers.length === 0}
                            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 font-semibold flex items-center disabled:opacity-50"
                          >
                              <Plus className="w-3 h-3 mr-1" /> Agregar
                          </button>
                      </div>

                      {assignments.length === 0 ? (
                          <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                              No hay asignaciones cargadas. {careers.length === 0 && "Asegúrese de crear carreras primero."}
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {assignments.map((assign, index) => {
                                  // Find available subjects for the selected career and year
                                  const careerObj = careers.find(c => c.name === assign.career);
                                  const availableSubjects = careerObj?.subjects.filter(s => s.year === assign.year) || [];

                                  return (
                                  <div key={assign.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col gap-3 animate-fadeIn">
                                      <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-gray-400 uppercase">Asignación #{index + 1}</span>
                                          <button type="button" onClick={() => removeAssignment(assign.id)} className="text-red-500 hover:text-red-700">
                                              <Minus className="w-4 h-4" />
                                          </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                              <label className="text-xs text-gray-500 block mb-1">Carrera</label>
                                              <select 
                                                  className="w-full text-xs border border-gray-300 rounded p-1.5"
                                                  value={assign.career}
                                                  onChange={(e) => updateAssignment(assign.id, 'career', e.target.value)}
                                              >
                                                  {careers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                              </select>
                                          </div>
                                          <div>
                                              <label className="text-xs text-gray-500 block mb-1">Año</label>
                                              <select 
                                                  className="w-full text-xs border border-gray-300 rounded p-1.5"
                                                  value={assign.year}
                                                  onChange={(e) => updateAssignment(assign.id, 'year', e.target.value)}
                                              >
                                                  {careers.find(c => c.name === assign.career)?.years.map(y => 
                                                    <option key={y} value={y}>{y}</option>
                                                  ) || <option>Seleccione Carrera</option>}
                                              </select>
                                          </div>
                                          <div className="md:col-span-2">
                                              <label className="text-xs text-gray-500 block mb-1">Materia / Curso</label>
                                              {availableSubjects.length > 0 ? (
                                                  <select
                                                      className="w-full text-xs border border-gray-300 rounded p-1.5 bg-white"
                                                      value={assign.subject || ''}
                                                      onChange={(e) => updateAssignment(assign.id, 'subject', e.target.value)}
                                                  >
                                                      <option value="">Seleccione Materia</option>
                                                      {availableSubjects.map(s => (
                                                          <option key={s.id} value={s.name}>{s.name}</option>
                                                      ))}
                                                  </select>
                                              ) : (
                                                  <input 
                                                      type="text" 
                                                      className="w-full text-xs border border-gray-300 rounded p-1.5"
                                                      placeholder="Ej. Programación I (o agregue materias en Gestión de Carreras)"
                                                      value={assign.subject || ''}
                                                      onChange={(e) => updateAssignment(assign.id, 'subject', e.target.value)}
                                                  />
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                )})}
                          </div>
                      )}
                  </div>
              )}

              <div className="pt-4 flex space-x-3 border-t border-gray-100 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center"
                >
                  <Save className="w-4 h-4 mr-2" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Create/Edit Career Modal */}
       {isCareerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">{editingCareerId ? 'Editar Carrera' : 'Nueva Carrera'}</h3>
              <button onClick={() => setIsCareerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCareer} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Carrera</label>
                    <input 
                        type="text" required
                        className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium placeholder-gray-400"
                        value={careerName}
                        onChange={e => setCareerName(e.target.value)}
                        placeholder="Ej. Tecnicatura en..."
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Años / Niveles</label>
                        <button 
                            type="button" 
                            onClick={handleAddYear}
                            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 font-medium"
                        >
                            + Agregar Año
                        </button>
                    </div>
                    <div className="space-y-2">
                        {careerYears.map((year, index) => (
                            <div key={index} className="flex gap-2">
                                <input 
                                    type="text"
                                    className="flex-1 border border-gray-600 bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={year}
                                    onChange={(e) => handleYearChange(index, e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveYear(index)}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                    disabled={careerYears.length === 1}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex space-x-3 border-t border-gray-100 mt-4">
                    <button 
                        type="button"
                        onClick={() => setIsCareerModalOpen(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center"
                    >
                        <Save className="w-4 h-4 mr-2" /> Guardar
                    </button>
                </div>
            </form>
          </div>
        </div>
       )}

        {/* Create/Edit Classroom Modal */}
        {isClassroomModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">{editingClassroomId ? 'Editar Aula' : 'Nueva Aula'}</h3>
                        <button onClick={() => setIsClassroomModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSaveClassroom} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Aula</label>
                            <input 
                                type="text" required
                                className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium placeholder-gray-400"
                                value={classroomName}
                                onChange={e => setClassroomName(e.target.value)}
                                placeholder="Ej. Aula 205, Laboratorio 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (Personas)</label>
                            <input 
                                type="number" required min="1"
                                className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium placeholder-gray-400"
                                value={classroomCapacity}
                                onChange={e => setClassroomCapacity(parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                            <input 
                                type="text" required
                                className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium placeholder-gray-400"
                                value={classroomLocation}
                                onChange={e => setClassroomLocation(e.target.value)}
                                placeholder="Ej. Planta Baja, Edificio Anexo"
                            />
                        </div>

                        <div className="pt-4 flex space-x-3 border-t border-gray-100 mt-4">
                            <button 
                                type="button"
                                onClick={() => setIsClassroomModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center"
                            >
                                <Save className="w-4 h-4 mr-2" /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;
