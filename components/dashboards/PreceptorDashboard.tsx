
import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, AlertCircle, CheckCircle, XCircle, Clock, Save, Users, MessageSquare, FileCheck, FileX, UserCircle, Mail, Phone, MapPin, Calendar, TrendingUp, GraduationCap, X, Plus, Trash2 } from 'lucide-react';
import { Student, JustificationRequest, FinalExamSession, Career, Subject, Classroom } from '../../types';
import { getJustificationRequests, updateJustificationStatus, getFinalExams, addFinalExam, deleteFinalExam, getCareers, getClassrooms } from '../../services/mockDatabase';

const MOCK_STUDENTS: Student[] = [
    { id: '1', name: 'Alvarez, Juan', grade: '1° Año - Soft.', attendance: 85, status: 'Regular' },
    { id: '2', name: 'Benitez, Clara', grade: '1° Año - Soft.', attendance: 92, status: 'Regular' },
    { id: '3', name: 'Castro, Pedro', grade: '1° Año - Soft.', attendance: 60, status: 'Riesgo' },
    { id: '4', name: 'Dominguez, Sol', grade: '2° Año - Enf.', attendance: 98, status: 'Regular' },
    { id: '5', name: 'Fernandez, Luis', grade: '3° Año - Prim.', attendance: 45, status: 'Libre' },
    { id: '6', name: 'Gomez, Maria', grade: '1° Año - Soft.', attendance: 88, status: 'Regular' },
    { id: '7', name: 'Lopez, Carlos', grade: '1° Año - Soft.', attendance: 70, status: 'Riesgo' },
];

type AttendanceStatus = 'present' | 'late' | 'absent' | null;

interface NotificationState {
    type: 'success' | 'error';
    message: string;
}

const PreceptorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'finals'>('attendance');
  
  // Attendance & General State
  const [searchTerm, setSearchTerm] = useState('');
  const [students] = useState(MOCK_STUDENTS);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [showObservationInput, setShowObservationInput] = useState<Record<string, boolean>>({});
  const [pendingRequests, setPendingRequests] = useState<JustificationRequest[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<Student | null>(null);

  // Finals Management State
  const [finalExams, setFinalExams] = useState<FinalExamSession[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  
  // New Final Form State
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [examTime, setExamTime] = useState<string>('');
  const [examProfessor, setExamProfessor] = useState<string>('');
  const [examClassroom, setExamClassroom] = useState<string>('');

  useEffect(() => {
      loadPendingRequests();
      loadData();
  }, []);

  const loadData = () => {
      setCareers(getCareers());
      setClassrooms(getClassrooms());
      // '0' user ID to get all finals without user-specific registration context
      setFinalExams(getFinalExams('0')); 
  };

  const loadPendingRequests = () => {
      const reqs = getJustificationRequests();
      setPendingRequests(reqs.filter(r => r.status === 'PENDING'));
  };

  // ... [Keeping existing attendance functions: handleStatusChange, markAllPresent, toggleObservation, updateObservation, showNotification, saveAttendanceSheet, handleJustificationAction, getStudentDetails] ...
  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach(s => {
        newAttendance[s.id] = 'present';
    });
    setAttendance(prev => ({ ...prev, ...newAttendance }));
  };

  const toggleObservation = (id: string) => {
      setShowObservationInput(prev => ({...prev, [id]: !prev[id]}));
  }

  const updateObservation = (id: string, text: string) => {
      setObservations(prev => ({...prev, [id]: text}));
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      setTimeout(() => {
          setNotification(null);
      }, 4000);
  };

  const saveAttendanceSheet = () => {
    const count = Object.keys(attendance).length;
    if (count === 0) {
        showNotification('error', "No has marcado ninguna asistencia para guardar.");
        return;
    }
    console.log({ attendance, observations });
    showNotification('success', `¡Planilla guardada correctamente! Se registraron ${count} alumnos.`);
  };

  const handleJustificationAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
      updateJustificationStatus(id, status);
      loadPendingRequests();
      showNotification(status === 'APPROVED' ? 'success' : 'error', 
        status === 'APPROVED' ? 'Justificación validada correctamente.' : 'Solicitud rechazada.'
      );
  };

  const getStudentDetails = (student: Student) => {
      const firstName = student.name.split(',')[1].trim().toLowerCase();
      const lastName = student.name.split(',')[0].trim().toLowerCase();
      return {
          email: `${firstName}.${lastName}@instituto.edu.ar`,
          phone: `(011) 15-${Math.floor(Math.random()*8999)+1000}-${Math.floor(Math.random()*8999)+1000}`,
          address: `Calle ${Math.floor(Math.random()*100)} N° ${Math.floor(Math.random()*5000)}, Localidad`,
          birthDate: `199${Math.floor(Math.random()*9)}-${Math.floor(Math.random()*11)+1}-${Math.floor(Math.random()*28)+1}`,
          dni: `${Math.floor(Math.random()*10000000)+30000000}`,
          average: (Math.random() * 3 + 6).toFixed(1), 
          history: [
              { date: '12/03/2024', event: 'Inicio de Cursada', type: 'info' },
              { date: '15/04/2024', event: 'Ausencia Justificada (Médica)', type: 'warning' },
              { date: '20/05/2024', event: 'Entrega de Documentación', type: 'success' },
          ]
      };
  };

  // --- Final Exams Logic ---
  
  const handleAddFinal = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedCareer || !selectedYear || !selectedSubject || !examDate || !examTime) return;

      const subjectName = careers.find(c => c.id === selectedCareer)?.subjects.find(s => s.id === selectedSubject)?.name || 'Desconocido';

      addFinalExam({
          careerId: selectedCareer,
          subjectId: selectedSubject,
          subjectName: subjectName,
          date: examDate,
          time: examTime,
          professor: examProfessor || 'A designar',
          classroom: examClassroom || 'A confirmar'
      });

      loadData(); // Refresh List
      showNotification('success', 'Mesa de examen creada correctamente');
      
      // Reset partial form
      setExamProfessor('');
      setExamClassroom('');
  };

  const handleDeleteFinal = (id: string) => {
      if(window.confirm('¿Eliminar esta mesa de examen?')) {
          deleteFinalExam(id);
          loadData();
          showNotification('success', 'Mesa eliminada');
      }
  };

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
        s.name.toLowerCase().includes(term) ||
        s.grade.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term)
    );
  });

  // Derived data for selects
  const career = careers.find(c => c.id === selectedCareer);
  const availableYears = career ? career.years : [];
  const availableSubjects = career && selectedYear ? career.subjects.filter(s => s.year === selectedYear) : [];

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Panel de Preceptoría</h2>
            <p className="text-gray-500 text-sm">Gestión administrativa y seguimiento de alumnos.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('attendance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'attendance' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Asistencia
            </button>
            <button 
                onClick={() => setActiveTab('finals')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'finals' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Gestión de Finales
            </button>
        </div>
      </div>

      {activeTab === 'attendance' && (
          <>
            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Buscar por nombre, curso o estado..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-white font-medium placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Pending Justifications Section */}
            {pendingRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden animate-fadeIn">
                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                        <h3 className="font-bold text-indigo-900 flex items-center">
                            <FileCheck className="w-5 h-5 mr-2" /> Solicitudes de Justificación Pendientes
                        </h3>
                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-gray-50 transition">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <span className="font-bold text-gray-800 mr-3">{req.studentName}</span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{req.courseName}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        <span className="font-semibold text-gray-700">Fecha Falta:</span> {new Date(req.date).toLocaleDateString()}
                                    </div>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 italic">
                                        "{req.reason}"
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3 pt-2">
                                    <button 
                                        onClick={() => handleJustificationAction(req.id, 'APPROVED')}
                                        className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition text-sm font-medium"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1.5" /> Validar
                                    </button>
                                    <button 
                                        onClick={() => handleJustificationAction(req.id, 'REJECTED')}
                                        className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition text-sm font-medium"
                                    >
                                        <FileX className="w-4 h-4 mr-1.5" /> Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Attendance Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-teal-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="font-bold text-teal-900 flex items-center text-lg">
                            <ClipboardList className="w-6 h-6 mr-2" /> Curso: Tec. Desarrollo de Software - 1° Año
                        </h3>
                        <p className="text-sm text-teal-700 mt-1 ml-8">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    
                    <div className="flex space-x-3">
                        <button 
                            onClick={markAllPresent}
                            className="bg-white border border-teal-200 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center shadow-sm"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Todos Presentes
                        </button>
                        <button 
                            onClick={saveAttendanceSheet}
                            className="bg-teal-600 text-white hover:bg-teal-700 px-6 py-2 rounded-lg text-sm font-bold transition flex items-center shadow-md"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Planilla
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumno</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado Académico</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Asistencia Hoy</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Observaciones</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                    {filteredStudents.map((student) => {
                        const status = attendance[student.id];
                        return (
                            <React.Fragment key={student.id}>
                                <tr className={`hover:bg-gray-50 transition ${status ? 'bg-opacity-20' : ''} ${status === 'absent' ? 'bg-red-50' : status === 'present' ? 'bg-green-50' : status === 'late' ? 'bg-yellow-50' : ''}`}>
                                <td 
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer group" 
                                    onClick={() => setSelectedStudentProfile(student)}
                                    title="Ver Perfil del Alumno"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800 text-base group-hover:text-teal-600 transition flex items-center">
                                            {student.name}
                                            <UserCircle className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition text-teal-500" />
                                        </span>
                                        <span className="text-xs text-gray-500">{student.grade}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                        student.status === 'Regular' ? 'bg-green-100 text-green-800 border border-green-200' :
                                        student.status === 'Riesgo' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                        'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                    {student.status} ({student.attendance}%)
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex justify-center space-x-1">
                                        <button 
                                            onClick={() => handleStatusChange(student.id, 'present')}
                                            className={`flex items-center px-3 py-2 rounded-l-lg border transition-all duration-200 ${
                                                status === 'present' 
                                                ? 'bg-green-600 text-white border-green-600 shadow-inner' 
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                            }`}
                                            title="Presente"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            <span className="text-xs font-bold">P</span>
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(student.id, 'late')}
                                            className={`flex items-center px-3 py-2 border-t border-b transition-all duration-200 ${
                                                status === 'late' 
                                                ? 'bg-yellow-500 text-white border-yellow-500 shadow-inner' 
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                            }`}
                                            title="Tarde"
                                        >
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span className="text-xs font-bold">T</span>
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(student.id, 'absent')}
                                            className={`flex items-center px-3 py-2 rounded-r-lg border transition-all duration-200 ${
                                                status === 'absent' 
                                                ? 'bg-red-600 text-white border-red-600 shadow-inner' 
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                            }`}
                                            title="Ausente"
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            <span className="text-xs font-bold">A</span>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button 
                                        onClick={() => toggleObservation(student.id)}
                                        className={`p-2 rounded-full transition ${
                                            observations[student.id] 
                                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                        }`}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                </td>
                                </tr>
                                {showObservationInput[student.id] && (
                                    <tr className="bg-gray-50 animate-fadeIn">
                                        <td colSpan={4} className="px-6 py-3 border-b border-gray-200">
                                            <div className="flex items-center">
                                                <span className="text-xs font-semibold text-gray-500 mr-3 uppercase tracking-wide">Observación:</span>
                                                <input 
                                                    type="text"
                                                    className="flex-1 border border-gray-600 bg-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 text-white placeholder-gray-400"
                                                    placeholder={`Nota sobre ${student.name} (ej. certificado médico, retiro anticipado)...`}
                                                    value={observations[student.id] || ''}
                                                    onChange={(e) => updateObservation(student.id, e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
                </div>
                <div className="bg-gray-50 p-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                    <span>Mostrando {filteredStudents.length} alumnos</span>
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-600 mr-1"></div> Presente</span>
                        <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div> Tarde</span>
                        <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-600 mr-1"></div> Ausente</span>
                    </div>
                </div>
            </div>
          </>
      )}

      {activeTab === 'finals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-teal-900 mb-4 flex items-center">
                      <Plus className="w-5 h-5 mr-2" /> Crear Nueva Mesa
                  </h3>
                  <form onSubmit={handleAddFinal} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                          <select 
                              className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                              value={selectedCareer}
                              onChange={(e) => {
                                  setSelectedCareer(e.target.value);
                                  setSelectedYear('');
                                  setSelectedSubject('');
                              }}
                          >
                              <option value="">Seleccionar Carrera</option>
                              {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Año / Curso</label>
                          <select 
                              className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                              value={selectedYear}
                              onChange={(e) => {
                                  setSelectedYear(e.target.value);
                                  setSelectedSubject('');
                              }}
                              disabled={!selectedCareer}
                          >
                              <option value="">Seleccionar Año</option>
                              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                          <select 
                              className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                              value={selectedSubject}
                              onChange={(e) => setSelectedSubject(e.target.value)}
                              disabled={!selectedYear}
                          >
                              <option value="">Seleccionar Materia</option>
                              {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                              <input 
                                  type="date"
                                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                  value={examDate}
                                  onChange={(e) => setExamDate(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                              <input 
                                  type="time"
                                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                  value={examTime}
                                  onChange={(e) => setExamTime(e.target.value)}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
                          <input 
                              type="text"
                              className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 outline-none"
                              placeholder="Nombre del docente"
                              value={examProfessor}
                              onChange={(e) => setExamProfessor(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
                          <select
                              className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                              value={examClassroom}
                              onChange={(e) => setExamClassroom(e.target.value)}
                          >
                              <option value="">Seleccionar Aula</option>
                              {classrooms.map(c => <option key={c.id} value={c.name}>{c.name} ({c.location})</option>)}
                          </select>
                      </div>

                      <button 
                          type="submit"
                          className="w-full bg-teal-600 text-white py-2 rounded-lg font-bold hover:bg-teal-700 transition mt-2 shadow-md"
                      >
                          Guardar Mesa
                      </button>
                  </form>
              </div>

              {/* Right: List */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-700">Mesas de Examen Programadas</h3>
                      <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" /> Total: {finalExams.length}
                      </div>
                  </div>
                  <div className="overflow-y-auto max-h-[600px]">
                      {finalExams.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 italic">
                              No hay mesas creadas. Utilice el formulario para agregar una.
                          </div>
                      ) : (
                          <div className="divide-y divide-gray-100">
                              {finalExams.map(exam => (
                                  <div key={exam.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                      <div className="flex-1">
                                          <h4 className="font-bold text-gray-800 text-sm">{exam.subjectName}</h4>
                                          <div className="flex flex-wrap gap-y-1 gap-x-4 mt-1 text-xs text-gray-500">
                                              <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(exam.date).toLocaleDateString()} {exam.time}hs</span>
                                              <span className="flex items-center"><UserCircle className="w-3 h-3 mr-1" /> {exam.professor}</span>
                                              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {exam.classroom}</span>
                                          </div>
                                      </div>
                                      <div className="flex items-center space-x-4">
                                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                                              {exam.registeredCount} inscriptos
                                          </span>
                                          <button 
                                              onClick={() => handleDeleteFinal(exam.id)}
                                              className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition"
                                              title="Eliminar mesa"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Alerts Section (Only on Attendance Tab) */}
      {activeTab === 'attendance' && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex">
            <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-bold text-orange-800">Alertas Importantes</h3>
                <div className="mt-2 text-sm text-orange-700">
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Castro, Pedro:</strong> Ha superado el límite de faltas (15% de inasistencias).</li>
                    <li><strong>1° Año Soft:</strong> Entrega de documentación hasta el viernes.</li>
                </ul>
                </div>
            </div>
            </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl border flex items-center space-x-3 z-50 transition-all transform translate-y-0 opacity-100 animate-fade-in-up ${
            notification.type === 'success' ? 'bg-teal-900 border-teal-700 text-white' : 'bg-red-900 border-red-700 text-white'
        }`}>
            {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-teal-400" />
            ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
            )}
            <div>
                <p className="font-bold text-sm">{notification.type === 'success' ? 'Éxito' : 'Atención'}</p>
                <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-4 text-white hover:text-gray-300">
                <XCircle className="w-5 h-5" />
            </button>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header Legajo */}
                <div className="p-6 bg-gradient-to-r from-teal-800 to-teal-900 flex justify-between items-start text-white">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                            {selectedStudentProfile.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{selectedStudentProfile.name}</h2>
                            <p className="text-teal-200 text-sm">ID: {selectedStudentProfile.id.toUpperCase()}</p>
                            <div className="flex space-x-3 mt-2">
                                <span className="px-2 py-0.5 bg-teal-700/50 rounded text-xs border border-teal-500">
                                    {selectedStudentProfile.status}
                                </span>
                                <span className="px-2 py-0.5 bg-teal-700/50 rounded text-xs border border-teal-500">Plan 2024</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedStudentProfile(null)} className="text-teal-200 hover:text-white hover:bg-white/10 p-1 rounded-full transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {(() => {
                        const details = getStudentDetails(selectedStudentProfile);
                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Col: Profile */}
                                <div className="space-y-6">
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
                                            <UserCircle className="w-5 h-5 mr-2 text-teal-600" /> Datos Personales
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-start space-x-3">
                                                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Correo Institucional</p>
                                                    <p className="text-gray-800 font-medium">{details.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Teléfono</p>
                                                    <p className="text-gray-800 font-medium">{details.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Domicilio</p>
                                                    <p className="text-gray-800 font-medium">{details.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Fecha de Nacimiento</p>
                                                    <p className="text-gray-800 font-medium">{details.birthDate}</p>
                                                </div>
                                            </div>
                                            <div className="pt-3 mt-3 border-t border-gray-100">
                                                <p className="text-gray-500 text-xs">DNI</p>
                                                <p className="text-gray-800 font-bold">{details.dni}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: Academic & History */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">Promedio General</p>
                                                <p className="text-2xl font-bold text-gray-800">{details.average}</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-full">
                                                <TrendingUp className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">Asistencia Acumulada</p>
                                                <p className="text-2xl font-bold text-gray-800">{selectedStudentProfile.attendance}%</p>
                                            </div>
                                            <div className={`p-3 rounded-full ${selectedStudentProfile.attendance >= 80 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                                <Clock className={`w-6 h-6 ${selectedStudentProfile.attendance >= 80 ? 'text-blue-600' : 'text-orange-500'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-5 border-b border-gray-100">
                                            <h3 className="font-bold text-gray-800 flex items-center">
                                                <ClipboardList className="w-5 h-5 mr-2 text-teal-600" /> Historial de Novedades
                                            </h3>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="divide-y divide-gray-100">
                                                {details.history.map((item, idx) => (
                                                    <div key={idx} className="p-4 flex items-center hover:bg-gray-50">
                                                        <div className={`w-2 h-2 rounded-full mr-4 ${
                                                            item.type === 'info' ? 'bg-blue-500' : 
                                                            item.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                                                        }`}></div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{item.event}</p>
                                                            <p className="text-xs text-gray-500">{item.date}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PreceptorDashboard;
