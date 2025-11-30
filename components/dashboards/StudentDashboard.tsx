
import React, { useState, useEffect } from 'react';
import { Calendar, Book, MessageCircle, Send, Award, ChevronLeft, FileText, Link as LinkIcon, Video, Download, Clock, User, CalendarClock, MapPin, FileWarning, X, Upload, CheckCircle, Loader2, History, AlertCircle, ClipboardCheck, Lock } from 'lucide-react';
import { generateTutorResponse } from '../../services/geminiService';
import { getStudentCourses, addJustificationRequest, getJustificationRequests, getFinalExams, toggleFinalRegistration } from '../../services/mockDatabase';
import { StudentCourse, JustificationRequest, FinalExamSession } from '../../types';

const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
  const [todaysClasses, setTodaysClasses] = useState<StudentCourse[]>([]);

  // Chat state
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: '¡Hola! Soy tu tutor virtual. ¿En qué materia necesitas ayuda hoy?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Justification Modal State
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [justifyDate, setJustifyDate] = useState('');
  const [justifyReason, setJustifyReason] = useState('');
  const [isSubmittingJustification, setIsSubmittingJustification] = useState(false);
  const [justificationSuccess, setJustificationSuccess] = useState(false);

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<JustificationRequest[]>([]);

  // Final Exams State
  const [isFinalsModalOpen, setIsFinalsModalOpen] = useState(false);
  const [availableFinals, setAvailableFinals] = useState<FinalExamSession[]>([]);
  const [finalsNotification, setFinalsNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
      // Load mock courses
      const studentCourses = getStudentCourses('1');
      setCourses(studentCourses);

      // Filter for today's schedule
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const today = days[new Date().getDay()];
      
      // Simple string matching for demo purposes (e.g., checks if "Lun" is in "Lun 08:00")
      const todayCourses = studentCourses.filter(c => c.schedule.includes(today) || (today === 'Mié' && c.schedule.includes('Mie')));
      setTodaysClasses(todayCourses);
  }, []);

  useEffect(() => {
      if (isHistoryModalOpen) {
          // Load requests for the logged in student (mock ID '1')
          const allRequests = getJustificationRequests();
          setMyRequests(allRequests.filter(r => r.studentId === '1' || r.studentId === '2')); // Showing diverse mock data
      }
  }, [isHistoryModalOpen]);

  useEffect(() => {
      if (isFinalsModalOpen) {
          loadFinals();
      }
  }, [isFinalsModalOpen]);

  const loadFinals = () => {
      const finals = getFinalExams('1'); // Mock ID '1'
      setAvailableFinals(finals);
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    // Mock subject context
    const context = selectedCourse ? selectedCourse.name : "General";
    const response = await generateTutorResponse(userMsg, context);
    
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    setIsChatLoading(false);
  };

  const handleJustifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setIsSubmittingJustification(true);
    
    // Simulate API delay
    setTimeout(() => {
        addJustificationRequest({
            studentId: '1', // Mock ID
            studentName: 'Alumno Demo',
            courseName: selectedCourse.name,
            date: justifyDate,
            reason: justifyReason
        });
        setIsSubmittingJustification(false);
        setJustificationSuccess(true);
        
        // Close modal after success
        setTimeout(() => {
            setIsJustifyModalOpen(false);
            setJustificationSuccess(false);
            setJustifyDate('');
            setJustifyReason('');
        }, 2000);
    }, 1500);
  };

  const handleRegisterFinal = (examId: string) => {
      const newStatus = toggleFinalRegistration('1', examId); // Mock ID '1'
      loadFinals(); // Refresh list
      
      setFinalsNotification({
          msg: newStatus ? '¡Inscripción realizada con éxito!' : 'Te has dado de baja de la mesa.',
          type: 'success'
      });

      setTimeout(() => setFinalsNotification(null), 3000);
  };

  const getResourceIcon = (type: string) => {
      switch(type) {
          case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
          case 'video': return <Video className="w-5 h-5 text-blue-500" />;
          case 'link': return <LinkIcon className="w-5 h-5 text-indigo-500" />;
          default: return <FileText className="w-5 h-5 text-gray-500" />;
      }
  };

  // Check if student can register for exam based on their course status
  const canRegisterForExam = (exam: FinalExamSession) => {
      // Match mock exam ID/Subject with student courses
      // In a real app, compare by Subject ID. Here we use Name matching or explicit ID link
      const relatedCourse = courses.find(c => 
          c.id === exam.subjectId || c.name === exam.subjectName
      );

      if (!relatedCourse) return { allowed: false, reason: "No cursas esta materia" };
      
      if (relatedCourse.academicStatus === 'Cursada Aprobada') return { allowed: true };
      if (relatedCourse.academicStatus === 'Promocionado') return { allowed: false, reason: "Ya promocionaste" };
      
      return { allowed: false, reason: "Cursada no aprobada" };
  };

  // Mock absence history data
  const mockAbsenceHistory = [
      { date: '2024-04-12', type: 'Ausente', status: 'Justificada' },
      { date: '2024-04-28', type: 'Tarde', status: '-' },
      { date: '2024-05-05', type: 'Ausente', status: 'Injustificada' },
      { date: '2024-05-10', type: 'Ausente', status: 'Pendiente' },
  ];

  const renderCourseDetail = (course: StudentCourse) => (
      <div className="space-y-6 animate-fadeIn relative">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200 transition"
              >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                  <h2 className="text-2xl font-bold text-gray-800">{course.name}</h2>
                  <div className="flex items-center space-x-3 text-sm mt-1">
                      <span className="text-gray-500 flex items-center">
                          <User className="w-4 h-4 mr-1" /> {course.professor}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          course.academicStatus === 'Cursada Aprobada' ? 'bg-green-50 text-green-700 border-green-200' :
                          course.academicStatus === 'Promocionado' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                          {course.academicStatus}
                      </span>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-600" /> Asistencia
                      </div>
                      <button 
                        onClick={() => setIsJustifyModalOpen(true)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition flex items-center border border-blue-200"
                      >
                          <FileWarning className="w-3 h-3 mr-1" /> Justificar Falta
                      </button>
                  </h3>
                  <div className="flex items-center justify-center py-4">
                      <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="3"
                              />
                              <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke={course.attendance >= 75 ? "#10B981" : "#F59E0B"}
                                  strokeWidth="3"
                                  strokeDasharray={`${course.attendance}, 100`}
                              />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-bold text-gray-800">{course.attendance}%</span>
                              <span className="text-xs text-gray-500">Presente</span>
                          </div>
                      </div>
                  </div>
                  <div className="text-center mt-2 space-y-2">
                      <p className="text-sm text-gray-500">
                          {course.attendance >= 75 ? 'Condición: REGULAR' : 'Condición: EN RIESGO'}
                      </p>
                      <button 
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-800 hover:underline flex items-center justify-center w-full"
                      >
                          <History className="w-3 h-3 mr-1" /> Ver Detalle de Faltas
                      </button>
                  </div>
              </div>

              {/* Exams Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-red-500" /> Próximos Parciales
                  </h3>
                  <div className="space-y-3">
                      {course.nextExams.length > 0 ? (
                          course.nextExams.map((exam, idx) => (
                              <div key={idx} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                  <div className="bg-white p-2 rounded border border-red-100 mr-3 text-center min-w-[50px]">
                                      <span className="block text-xs text-red-500 uppercase font-bold">{new Date(exam.date).toLocaleString('es-ES', { month: 'short' })}</span>
                                      <span className="block text-xl font-bold text-gray-800">{new Date(exam.date).getDate()}</span>
                                  </div>
                                  <div>
                                      <p className="font-medium text-gray-800">{exam.title}</p>
                                      <p className="text-xs text-gray-500">Presencial</p>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <p className="text-gray-500 text-sm italic">No hay exámenes programados próximamente.</p>
                      )}
                  </div>
              </div>
          </div>

          {/* Resources List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Book className="w-5 h-5 mr-2 text-indigo-600" /> Material de Estudio y Recursos
              </h3>
              <div className="space-y-2">
                  {course.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition group">
                          <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                  {getResourceIcon(resource.type)}
                              </div>
                              <div>
                                  <p className="font-medium text-gray-900">{resource.title}</p>
                                  <p className="text-xs text-gray-500 uppercase">{resource.type} • Subido el {resource.date}</p>
                              </div>
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition">
                              <Download className="w-5 h-5" />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Justification Modal */}
          {isJustifyModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Justificar Inasistencia</h3>
                        <button onClick={() => setIsJustifyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleJustifySubmit} className="p-6 space-y-5">
                        {!justificationSuccess ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la falta</label>
                                    <input 
                                        type="date"
                                        required
                                        value={justifyDate}
                                        onChange={(e) => setJustifyDate(e.target.value)}
                                        className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        value={justifyReason}
                                        onChange={(e) => setJustifyReason(e.target.value)}
                                        className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                        placeholder="Describe el motivo de la inasistencia..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificado (Opcional)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition bg-gray-50 cursor-pointer">
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <span className="font-medium text-indigo-600 hover:text-indigo-500">Subir archivo</span>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex space-x-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsJustifyModalOpen(false)}
                                        disabled={isSubmittingJustification}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmittingJustification || !justifyDate || !justifyReason}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {isSubmittingJustification ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Solicitud'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">¡Solicitud Enviada!</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Tu justificación ha sido enviada a Preceptoría para su revisión.
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
          )}

           {/* History Modal */}
           {isHistoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Historial de Inasistencias</h3>
                        <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Absence List */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Registro de Faltas</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {mockAbsenceHistory.map((record, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                        record.type === 'Ausente' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {record.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm">
                                                    <span className={`font-semibold ${
                                                        record.status === 'Justificada' ? 'text-green-600' : 
                                                        record.status === 'Injustificada' ? 'text-red-500' : 
                                                        record.status === 'Pendiente' ? 'text-orange-500' : 'text-gray-400'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Justification Requests */}
                        {myRequests.length > 0 && (
                             <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                    <FileWarning className="w-4 h-4 mr-1" /> Solicitudes Enviadas
                                </h4>
                                <div className="space-y-2">
                                    {myRequests.map((req) => (
                                        <div key={req.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-gray-800 text-sm">Falta del {new Date(req.date).toLocaleDateString()}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                     req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                                     req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {req.status === 'APPROVED' ? 'Aprobada' : req.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 italic">"{req.reason}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}

          {/* Final Exams Modal */}
          {isFinalsModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 bg-indigo-600 border-b border-indigo-700 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center">
                            <ClipboardCheck className="w-5 h-5 mr-2" /> Inscripción a Mesas de Examen
                        </h3>
                        <button onClick={() => setIsFinalsModalOpen(false)} className="text-indigo-200 hover:text-white hover:bg-indigo-700 rounded-full p-1 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {finalsNotification && (
                        <div className={`p-3 text-center text-sm font-bold ${finalsNotification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {finalsNotification.msg}
                        </div>
                    )}
                    
                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                        <div className="space-y-4">
                            {availableFinals.map(exam => {
                                const statusCheck = canRegisterForExam(exam);
                                return (
                                    <div key={exam.id} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4 transition ${statusCheck.allowed ? 'border-gray-200 hover:border-indigo-300' : 'border-gray-200 opacity-80 bg-gray-50'}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={`font-bold text-lg ${statusCheck.allowed ? 'text-gray-800' : 'text-gray-500'}`}>{exam.subjectName}</h4>
                                                {exam.isRegistered && (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold flex items-center">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Inscripto
                                                    </span>
                                                )}
                                                {!statusCheck.allowed && (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold flex items-center">
                                                        <Lock className="w-3 h-3 mr-1" /> {statusCheck.reason}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" /> 
                                                    {new Date(exam.date).toLocaleDateString()} - {exam.time}hs
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 mr-2 text-gray-400" /> 
                                                    {exam.professor}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" /> 
                                                    {exam.classroom}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => statusCheck.allowed ? handleRegisterFinal(exam.id) : null}
                                            disabled={!statusCheck.allowed}
                                            className={`px-5 py-2 rounded-lg font-medium text-sm transition shadow-sm whitespace-nowrap w-full md:w-auto cursor-pointer ${
                                                !statusCheck.allowed 
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : exam.isRegistered 
                                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                        >
                                            {exam.isRegistered ? 'Darse de Baja' : 'Inscribirse'}
                                        </button>
                                    </div>
                                );
                            })}
                            
                            {availableFinals.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                    No hay mesas de examen disponibles en este momento.
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-200 bg-white text-xs text-gray-500 flex justify-between items-center">
                        <span>Recuerda inscribirte 48hs antes del examen.</span>
                        <button onClick={() => setIsFinalsModalOpen(false)} className="text-gray-700 font-medium hover:text-gray-900">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
          )}
      </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Main Content */}
      <div className="lg:col-span-2 space-y-6">
        
        {!selectedCourse ? (
            <>
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">¡Hola, Sofía!</h2>
                        <p className="opacity-90 mt-1">Selecciona una materia para ver tus recursos y asistencia.</p>
                    </div>
                    {/* Finals Button on Banner */}
                    <button 
                        onClick={() => setIsFinalsModalOpen(true)}
                        className="hidden md:flex items-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-50 transition cursor-pointer"
                    >
                        <ClipboardCheck className="w-5 h-5 mr-2" /> Inscripción a Finales
                    </button>
                </div>

                {/* Mobile Finals Button */}
                <button 
                    onClick={() => setIsFinalsModalOpen(true)}
                    className="md:hidden w-full flex items-center justify-center bg-white border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition cursor-pointer"
                >
                    <ClipboardCheck className="w-5 h-5 mr-2" /> Inscripción a Finales
                </button>

                {/* Today's Schedule Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <CalendarClock className="w-5 h-5 mr-2 text-indigo-600" /> 
                            Horario de Hoy
                        </h3>
                        <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                   </div>

                   <div className="space-y-3">
                       {todaysClasses.length > 0 ? (
                           todaysClasses.map((course) => (
                               <div key={course.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 transition cursor-pointer" onClick={() => setSelectedCourse(course)}>
                                   <div className="flex-shrink-0 w-16 text-center mr-4">
                                       <p className="text-sm font-bold text-gray-800">{course.schedule.split(' ')[1] || 'Hora'}</p>
                                       <p className="text-xs text-gray-500">Inicio</p>
                                   </div>
                                   <div className="flex-1 border-l border-gray-200 pl-4">
                                       <p className="font-bold text-gray-800">{course.name}</p>
                                       <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            <span>Aula 204 • {course.professor}</span>
                                       </div>
                                   </div>
                                   <button className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                                       <ChevronLeft className="w-4 h-4 rotate-180" />
                                   </button>
                               </div>
                           ))
                       ) : (
                           <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                               <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                               <p className="text-gray-500 font-medium">No tienes clases programadas para hoy.</p>
                               <p className="text-xs text-gray-400">¡Aprovecha para estudiar!</p>
                           </div>
                       )}
                   </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(course => (
                        <div 
                            key={course.id} 
                            onClick={() => setSelectedCourse(course)}
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition">
                                    <Book className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    course.attendance >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {course.attendance}% Asistencia
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{course.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{course.professor}</p>
                            
                            <div className="flex items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
                                <Clock className="w-3 h-3 mr-1" />
                                {course.schedule}
                            </div>
                        </div>
                    ))}
                </div>

                 {/* Grades Preview (Simplified) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                        <Award className="w-5 h-5 mr-2 text-yellow-500" /> Últimas Calificaciones
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Materia</th>
                                <th className="px-4 py-2">Evaluación</th>
                                <th className="px-4 py-2">Nota</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-b">
                                <td className="px-4 py-3 font-medium">Matemáticas III</td>
                                <td className="px-4 py-3">Parcial 1</td>
                                <td className="px-4 py-3 text-green-600 font-bold">9.5</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-4 py-3 font-medium">Historia Arg. II</td>
                                <td className="px-4 py-3">Trabajo Práctico</td>
                                <td className="px-4 py-3 text-green-600 font-bold">8.0</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        ) : (
            renderCourseDetail(selectedCourse)
        )}
      </div>

      {/* Right Column: AI Tutor */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[600px] sticky top-4">
        <div className="p-4 border-b border-gray-200 bg-indigo-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" /> 
            {selectedCourse ? `Tutor de ${selectedCourse.name}` : "Tutor Virtual IA"}
          </h3>
          <p className="text-xs text-indigo-600">
              {selectedCourse ? "Pregunta sobre el contenido específico de esta materia." : "Ayuda general escolar."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none text-sm text-gray-500 animate-pulse">
                Escribiendo...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu duda..."
              className="flex-1 border border-gray-600 bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-medium placeholder-gray-400"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isChatLoading}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-gray-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
