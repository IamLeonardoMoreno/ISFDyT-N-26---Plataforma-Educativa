
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, FileText, ArrowLeft, Upload, GraduationCap, MoreVertical, X, CheckCircle, File as FileIcon, Loader2, Save, Archive, RefreshCcw, Mail, FileWarning, UserCircle, Phone, MapPin, Calendar, TrendingUp, AlertCircle, Send, AlertTriangle, Plus, Trash2, Sparkles } from 'lucide-react';
import { getTeacherCourses, getCourseStudents, toggleCourseStatus, addNotification, getCareers } from '../../services/mockDatabase';
import { TeacherCourse, CourseStudent, Career, Grade } from '../../types';
import { generateLessonPlan } from '../../services/geminiService';

const TeacherDashboard: React.FC = () => {
  
  // AI Planner State
  const [planTopic, setPlanTopic] = useState('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState(''); 
  const [selectedYear, setSelectedYear] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Courses State
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TeacherCourse | null>(null);
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);
  const [courseFilter, setCourseFilter] = useState<'active' | 'archived'>('active');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // --- NEW GRADEBOOK STATE ---
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [gradebookData, setGradebookData] = useState<CourseStudent[]>([]);
  const [evaluationColumns, setEvaluationColumns] = useState<string[]>([]); // List of evaluation titles
  const [newEvalName, setNewEvalName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isSavingGrades, setIsSavingGrades] = useState(false);
  const [gradesBuffer, setGradesBuffer] = useState<Record<string, string>>({}); // Kept for simple view fallback logic if needed, mostly superseded by gradebookData
  const [evaluationTitle, setEvaluationTitle] = useState(''); // Kept for simple view modal if used

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactRecipient, setContactRecipient] = useState<CourseStudent | null>(null);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Disciplinary Modal State
  const [isDisciplinaryModalOpen, setIsDisciplinaryModalOpen] = useState(false);
  const [disciplinaryReason, setDisciplinaryReason] = useState('');
  const [disciplinaryDesc, setDisciplinaryDesc] = useState('');
  const [disciplinarySeverity, setDisciplinarySeverity] = useState('Leve');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Student Actions Dropdown State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Legajo (Student Record) Modal State
  const [studentLegajo, setStudentLegajo] = useState<CourseStudent | null>(null);

  useEffect(() => {
      // Initialize data
      loadCourses();
      const loadedCareers = getCareers();
      setCareers(loadedCareers);
      if (loadedCareers.length > 0) {
          setSelectedCareer(loadedCareers[0].name);
          setSelectedYear(loadedCareers[0].years[0]);
      }
  }, []);

  useEffect(() => {
    // Update available years when career changes
    if (selectedCareer) {
        const career = careers.find(c => c.name === selectedCareer);
        if (career && career.years.length > 0) {
            setSelectedYear(career.years[0]);
        }
    }
  }, [selectedCareer, careers]);

  const loadCourses = () => {
      const myCourses = getTeacherCourses('2'); // '2' is mock ID for teacher
      setCourses([...myCourses]); 
  };

  useEffect(() => {
      if (selectedCourse) {
          // Load students for the selected course
          const students = getCourseStudents(selectedCourse.id);
          setCourseStudents(students);
      }
  }, [selectedCourse]);

  const handleGeneratePlan = async () => {
    if (!planTopic) return;
    setIsGenerating(true);
    const context = `${selectedYear} de ${selectedCareer}`;
    const result = await generateLessonPlan(planTopic, context);
    setGeneratedPlan(result);
    setIsGenerating(false);
  };

  // Course Management
  const handleToggleArchive = (e: React.MouseEvent, courseId: string) => {
      e.stopPropagation();
      const updatedCourses = toggleCourseStatus(courseId);
      setCourses([...updatedCourses]);
  };

  // Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setFileToUpload(file);
        if (!resourceTitle) {
            // Remove extension for default title
            setResourceTitle(file.name.split('.').slice(0, -1).join('.'));
        }
    }
  };

  const handleUploadConfirm = () => {
    if (!fileToUpload || !resourceTitle) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate network upload
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                setUploadSuccess(true);
                
                // NOTIFY STUDENTS (Mock: Notify ID '1' specifically for demo)
                if (selectedCourse) {
                    addNotification({
                        userId: '1', // Assuming '1' is the demo Student ID
                        title: `Nuevo Material: ${selectedCourse.name}`,
                        message: `El docente ha subido el recurso: "${resourceTitle}".`,
                        type: 'info'
                    });
                }

                // Auto close after delay
                setTimeout(() => {
                    closeUploadModal();
                }, 2000);
                return 100;
            }
            return prev + 10;
        });
    }, 200);
  };

  const closeUploadModal = () => {
      setIsUploadModalOpen(false);
      setFileToUpload(null);
      setResourceTitle('');
      setUploadProgress(0);
      setUploadSuccess(false);
      setIsUploading(false);
  };

  // --- NEW GRADEBOOK LOGIC ---

  const openGradebook = () => {
      // Clone students for editing
      const data = JSON.parse(JSON.stringify(courseStudents));
      setGradebookData(data);
      
      // Extract unique evaluation titles from all students
      const allTitles = new Set<string>();
      data.forEach((s: CourseStudent) => {
          s.grades.forEach(g => allTitles.add(g.title));
      });
      setEvaluationColumns(Array.from(allTitles));
      
      setIsGradesModalOpen(true);
  };

  const handleAddColumn = () => {
      if (!newEvalName.trim()) return;
      if (evaluationColumns.includes(newEvalName)) {
          alert("Ya existe una evaluación con este nombre.");
          return;
      }

      setEvaluationColumns([...evaluationColumns, newEvalName]);
      // Note: We don't need to add empty grades to students yet, 
      // the render loop will handle missing grades as empty inputs.
      setNewEvalName('');
      setIsAddingColumn(false);
  };

  const handleGradeChange = (studentId: string, evalTitle: string, value: string) => {
      const numValue = parseFloat(value);
      // Allow empty string or numbers 1-10
      if (value !== '' && (isNaN(numValue) || numValue < 1 || numValue > 10)) return;

      setGradebookData(prev => prev.map(student => {
          if (student.id === studentId) {
              const existingGradeIndex = student.grades.findIndex(g => g.title === evalTitle);
              const newGrades = [...student.grades];

              if (existingGradeIndex >= 0) {
                  if (value === '') {
                      // Remove grade if cleared
                      newGrades.splice(existingGradeIndex, 1);
                  } else {
                      // Update existing
                      newGrades[existingGradeIndex] = { ...newGrades[existingGradeIndex], value: numValue };
                  }
              } else if (value !== '') {
                  // Add new grade
                  newGrades.push({
                      id: Date.now().toString(),
                      title: evalTitle,
                      value: numValue,
                      date: new Date().toISOString().split('T')[0]
                  });
              }
              return { ...student, grades: newGrades };
          }
          return student;
      }));
  };

  const calculateAverage = (grades: Grade[]) => {
      if (grades.length === 0) return '-';
      const sum = grades.reduce((acc, curr) => acc + curr.value, 0);
      return (sum / grades.length).toFixed(1);
  };

  const getStudentStatus = (avgStr: string) => {
      const avg = parseFloat(avgStr);
      if (isNaN(avg)) return { text: '-', color: 'text-gray-400' };
      if (avg >= 7) return { text: 'Promocionado', color: 'text-green-600 bg-green-50' };
      if (avg >= 4) return { text: 'Regular', color: 'text-yellow-600 bg-yellow-50' };
      return { text: 'Recupera', color: 'text-red-600 bg-red-50' };
  };

  const handleSaveGradebook = () => {
      setIsSavingGrades(true);
      // Simulate API
      setTimeout(() => {
          setCourseStudents(gradebookData); // Update main view
          setIsSavingGrades(false);
          setIsGradesModalOpen(false);
          alert("Planilla de calificaciones actualizada correctamente.");
      }, 1000);
  };

  // Student Actions
  const toggleDropdown = (id: string) => {
      if (activeDropdownId === id) {
          setActiveDropdownId(null);
      } else {
          setActiveDropdownId(id);
      }
  };

  const handleStudentAction = (action: string, student: CourseStudent) => {
      setActiveDropdownId(null);
      switch(action) {
          case 'contact':
              setContactRecipient(student);
              setContactSubject('');
              setContactMessage('');
              setIsContactModalOpen(true);
              break;
          case 'justify':
              alert(`Se ha enviado la solicitud de justificación para: ${student.name}`);
              break;
          case 'record':
              setStudentLegajo(student);
              break;
      }
  };

  const handleSendEmail = () => {
      if (!contactRecipient || !contactSubject || !contactMessage) return;

      setIsSendingEmail(true);
      // Simulate API Call
      setTimeout(() => {
          setIsSendingEmail(false);
          setIsContactModalOpen(false);
          alert(`Mensaje enviado correctamente a ${contactRecipient.name}`);
          setContactRecipient(null);
      }, 1500);
  };

  // Disciplinary Report Handlers
  const handleOpenDisciplinary = () => {
      setDisciplinaryReason('');
      setDisciplinaryDesc('');
      setDisciplinarySeverity('Leve');
      setIsDisciplinaryModalOpen(true);
  };

  const handleSubmitDisciplinary = (e: React.FormEvent) => {
      e.preventDefault();
      if (!studentLegajo) return;

      setIsSubmittingReport(true);
      
      // Simulate API call
      setTimeout(() => {
          setIsSubmittingReport(false);
          setIsDisciplinaryModalOpen(false);
          alert(`Trámite disciplinario iniciado correctamente para ${studentLegajo.name}.\n\nN° de Expediente: ${Date.now()}\nLa solicitud ha sido derivada a Dirección.`);
      }, 2000);
  };

  // Mock data generator for specific student details
  const getStudentDetails = (student: CourseStudent) => {
      const firstName = student.name.split(',')[1].trim().toLowerCase();
      const lastName = student.name.split(',')[0].trim().toLowerCase();
      return {
          email: `${firstName}.${lastName}@instituto.edu.ar`,
          phone: `(011) 15-${Math.floor(Math.random()*8999)+1000}-${Math.floor(Math.random()*8999)+1000}`,
          address: `Calle ${Math.floor(Math.random()*100)} N° ${Math.floor(Math.random()*5000)}, Localidad`,
          birthDate: `199${Math.floor(Math.random()*9)}-${Math.floor(Math.random()*11)+1}-${Math.floor(Math.random()*28)+1}`,
          dni: `${Math.floor(Math.random()*10000000)+30000000}`,
          history: [
              { date: '12/04/2024', subject: 'TP N°1: Fundamentos', grade: 8 },
              { date: '25/04/2024', subject: 'Parcial Escrito', grade: student.lastGrade },
              { date: '10/05/2024', subject: 'Exposición Oral', grade: Math.min(10, student.lastGrade + 1) },
          ]
      };
  };

  // Filtered courses for display
  const displayedCourses = courses.filter(c => c.status === courseFilter);

  // Detailed View for a Course
  if (selectedCourse) {
      return (
          <div className="space-y-6 animate-fadeIn relative">
              {/* Header */}
              <div className="flex items-center space-x-4">
                  <button 
                      onClick={() => setSelectedCourse(null)}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200 transition"
                  >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedCourse.name}</h2>
                      <p className="text-gray-500 flex items-center text-sm">
                          {selectedCourse.career} • {selectedCourse.year}
                      </p>
                  </div>
              </div>

              {/* Actions Bar */}
              <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm"
                  >
                      <Upload className="w-4 h-4 mr-2" /> Subir Material
                  </button>
                  <button 
                    onClick={openGradebook}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium shadow-sm"
                  >
                      <GraduationCap className="w-4 h-4 mr-2" /> Gestionar Calificaciones
                  </button>
              </div>

              {/* Student List (Simplified View) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* ... [Keep existing table view logic for simplified list] ... */}
                  <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-indigo-600" /> Listado de Alumnos
                      </h3>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{courseStudents.length} inscriptos</span>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio Actual</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                              {courseStudents.map((student) => {
                                  const avg = calculateAverage(student.grades);
                                  return (
                                  <tr key={student.id} className="hover:bg-gray-50 transition relative">
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="font-medium text-gray-900">{student.name}</div>
                                          <div className="text-xs text-gray-500">ID: {student.id.split('-').pop()}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-center">
                                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                              student.attendance >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                              {student.attendance}%
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-center">
                                          <span className={`font-bold ${parseFloat(avg) >= 7 ? 'text-green-600' : parseFloat(avg) >= 4 ? 'text-yellow-600' : 'text-red-500'}`}>
                                              {avg}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                          <button 
                                            onClick={() => toggleDropdown(student.id)}
                                            className={`p-2 rounded-full transition ${activeDropdownId === student.id ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'}`}
                                          >
                                              <MoreVertical className="w-5 h-5" />
                                          </button>
                                          
                                          {activeDropdownId === student.id && (
                                            <>
                                                <div className="fixed inset-0 z-10 cursor-default" onClick={() => setActiveDropdownId(null)} />
                                                <div className="absolute right-8 top-8 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100 animate-fadeIn">
                                                    <button onClick={() => handleStudentAction('contact', student)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"><Mail className="w-4 h-4 mr-2" /> Contactar</button>
                                                    <button onClick={() => handleStudentAction('justify', student)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"><FileWarning className="w-4 h-4 mr-2" /> Justificar Falta</button>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button onClick={() => handleStudentAction('record', student)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"><UserCircle className="w-4 h-4 mr-2" /> Ver Legajo</button>
                                                </div>
                                            </>
                                          )}
                                      </td>
                                  </tr>
                              )})}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* NEW GRADEBOOK MODAL */}
              {isGradesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 bg-indigo-900 border-b border-indigo-800 flex justify-between items-center text-white">
                            <div>
                                <h3 className="font-bold text-lg flex items-center">
                                    <GraduationCap className="w-5 h-5 mr-2 text-indigo-300" /> Planilla de Calificaciones
                                </h3>
                                <p className="text-xs text-indigo-200">{selectedCourse.name} - {selectedCourse.career}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => setIsAddingColumn(!isAddingColumn)}
                                    className={`text-xs px-3 py-1.5 rounded border ${isAddingColumn ? 'bg-indigo-800 border-indigo-600' : 'bg-transparent border-indigo-400 hover:bg-indigo-800'} transition`}
                                >
                                    {isAddingColumn ? 'Cancelar' : '+ Nueva Evaluación'}
                                </button>
                                <button onClick={() => setIsGradesModalOpen(false)} className="text-indigo-300 hover:text-white hover:bg-indigo-800 p-1 rounded-full transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Toolbar / Add Column */}
                        {isAddingColumn && (
                            <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex items-center space-x-3 animate-fadeIn">
                                <input 
                                    type="text" 
                                    placeholder="Nombre de la evaluación (Ej. TP 2, Parcial 2)"
                                    className="flex-1 border border-indigo-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newEvalName}
                                    onChange={(e) => setNewEvalName(e.target.value)}
                                    autoFocus
                                />
                                <button 
                                    onClick={handleAddColumn}
                                    disabled={!newEvalName}
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Agregar Columna
                                </button>
                            </div>
                        )}

                        {/* Gradebook Table */}
                        <div className="flex-1 overflow-auto">
                            <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-200">
                                            Alumno
                                        </th>
                                        {evaluationColumns.map(col => (
                                            <th key={col} className="px-2 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider min-w-[100px] border-r border-gray-100">
                                                {col}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 border-l border-indigo-100">
                                            Promedio
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {gradebookData.map((student, idx) => {
                                        const avgStr = calculateAverage(student.grades);
                                        const status = getStudentStatus(avgStr);
                                        
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 group-hover:bg-gray-50">
                                                    {student.name}
                                                </td>
                                                {evaluationColumns.map(col => {
                                                    const grade = student.grades.find(g => g.title === col);
                                                    return (
                                                        <td key={col} className="px-2 py-2 text-center border-r border-gray-100">
                                                            <input 
                                                                type="number"
                                                                min="1" max="10" step="0.5"
                                                                className={`w-16 text-center border rounded py-1 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
                                                                    grade ? (grade.value >= 7 ? 'text-green-600 border-green-200 bg-green-50/30' : grade.value >= 4 ? 'text-yellow-600 border-yellow-200 bg-yellow-50/30' : 'text-red-600 border-red-200 bg-red-50/30') : 'border-gray-200 text-gray-800'
                                                                }`}
                                                                value={grade ? grade.value : ''}
                                                                onChange={(e) => handleGradeChange(student.id, col, e.target.value)}
                                                                placeholder="-"
                                                            />
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-3 text-center text-sm font-bold text-indigo-700 bg-indigo-50/50 border-l border-indigo-100">
                                                    {avgStr}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${status.color} border-opacity-20`}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                                <p>• Calificaciones se guardan automáticamente al presionar Guardar.</p>
                                <p>• Use punto para decimales (ej. 7.5).</p>
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => setIsGradesModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSaveGradebook}
                                    disabled={isSavingGrades}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm disabled:opacity-50"
                                >
                                    {isSavingGrades ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Upload Modal */}
              {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Subir Material al Curso</h3>
                            <button onClick={closeUploadModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            {!uploadSuccess ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título del Recurso</label>
                                        <input 
                                            type="text"
                                            value={resourceTitle}
                                            onChange={(e) => setResourceTitle(e.target.value)}
                                            className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                            placeholder="Ej. Guía de Ejercicios Unidad 1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Archivo</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition bg-gray-50">
                                            <div className="space-y-1 text-center">
                                                {fileToUpload ? (
                                                    <div className="flex flex-col items-center">
                                                        <FileIcon className="mx-auto h-12 w-12 text-indigo-500" />
                                                        <p className="mt-2 text-sm text-gray-900 font-medium">{fileToUpload.name}</p>
                                                        <p className="text-xs text-gray-500">{(fileToUpload.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        <button 
                                                            onClick={() => {setFileToUpload(null); setResourceTitle('');}}
                                                            className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                                                        >
                                                            Remover archivo
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                                <span>Subir un archivo</span>
                                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.ppt,.pptx" />
                                                            </label>
                                                            <p className="pl-1">o arrastrar y soltar</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PDF, DOC, PPT hasta 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isUploading && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-600">
                                                <span>Subiendo...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 flex space-x-3">
                                        <button 
                                            type="button"
                                            onClick={closeUploadModal}
                                            disabled={isUploading}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleUploadConfirm}
                                            disabled={!fileToUpload || !resourceTitle || isUploading}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subir Material'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">¡Archivo subido con éxito!</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        El material "{resourceTitle}" ya está disponible para los alumnos del curso.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              )}

              {/* Contact Modal */}
              {isContactModalOpen && contactRecipient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center">
                                <Mail className="w-5 h-5 mr-2" /> Contactar Alumno
                            </h3>
                            <button onClick={() => setIsContactModalOpen(false)} className="text-indigo-100 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center">
                                <div className="bg-indigo-200 p-2 rounded-full mr-3">
                                    <UserCircle className="w-5 h-5 text-indigo-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-600 font-bold uppercase">Destinatario</p>
                                    <p className="font-medium text-gray-800">{contactRecipient.name}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                                <input 
                                    type="text"
                                    value={contactSubject}
                                    onChange={(e) => setContactSubject(e.target.value)}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                    placeholder="Ej. Consulta sobre inasistencias"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                <textarea 
                                    value={contactMessage}
                                    onChange={(e) => setContactMessage(e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                                    placeholder="Escribe tu mensaje aquí..."
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button 
                                    onClick={() => setIsContactModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSendEmail}
                                    disabled={!contactSubject || !contactMessage || isSendingEmail}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSendingEmail ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" /> Enviar Mensaje
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Legajo (Student Record) Modal */}
              {studentLegajo && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                         {/* Header Legajo */}
                        <div className="p-6 bg-gradient-to-r from-indigo-800 to-indigo-900 flex justify-between items-start text-white">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                    {studentLegajo.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{studentLegajo.name}</h2>
                                    <p className="text-indigo-200 text-sm">ID: {studentLegajo.id.toUpperCase()}</p>
                                    <div className="flex space-x-3 mt-2">
                                        <span className="px-2 py-0.5 bg-indigo-700/50 rounded text-xs border border-indigo-500">Regular</span>
                                        <span className="px-2 py-0.5 bg-indigo-700/50 rounded text-xs border border-indigo-500">Plan 2024</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setStudentLegajo(null)} className="text-indigo-200 hover:text-white hover:bg-white/10 p-1 rounded-full transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                            {(() => {
                                const details = getStudentDetails(studentLegajo);
                                return (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Col: Profile */}
                                        <div className="space-y-6">
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                                <h3 className="font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
                                                    <UserCircle className="w-5 h-5 mr-2 text-indigo-600" /> Datos Personales
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
                                            
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                                <h3 className="font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
                                                    <AlertCircle className="w-5 h-5 mr-2 text-orange-500" /> Observaciones
                                                </h3>
                                                <p className="text-sm text-gray-600 italic">
                                                    "Alumno participativo en clase. Muestra gran interés por los contenidos prácticos. Recomendable seguimiento en fechas de entrega."
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Col: Academic */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Promedio General</p>
                                                        <p className="text-2xl font-bold text-gray-800">{studentLegajo.lastGrade}</p>
                                                    </div>
                                                    <div className="bg-green-50 p-3 rounded-full">
                                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Porcentaje Asistencia</p>
                                                        <p className="text-2xl font-bold text-gray-800">{studentLegajo.attendance}%</p>
                                                    </div>
                                                    <div className={`p-3 rounded-full ${studentLegajo.attendance >= 80 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                                        <Clock className={`w-6 h-6 ${studentLegajo.attendance >= 80 ? 'text-blue-600' : 'text-orange-500'}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                                <div className="p-5 border-b border-gray-100">
                                                     <h3 className="font-bold text-gray-800 flex items-center">
                                                        <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" /> Historial Académico Reciente
                                                    </h3>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-100">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instancia</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Calificación</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {details.history.map((item, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.subject}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span className={`font-bold ${item.grade >= 7 ? 'text-green-600' : 'text-red-500'}`}>
                                                                            {item.grade}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                                                <p className="text-sm text-indigo-800 font-medium">¿Necesitas reportar una incidencia grave?</p>
                                                <button 
                                                    onClick={handleOpenDisciplinary}
                                                    className="text-xs bg-white text-indigo-600 px-3 py-2 rounded border border-indigo-200 hover:bg-indigo-600 hover:text-white transition shadow-sm font-bold"
                                                >
                                                    Iniciar Trámite Disciplinario
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                 </div>
              )}

              {/* Disciplinary Report Modal */}
              {isDisciplinaryModalOpen && studentLegajo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 bg-red-600 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Iniciar Trámite Disciplinario
                            </h3>
                            <button onClick={() => setIsDisciplinaryModalOpen(false)} className="text-red-100 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800">
                                <strong>Atención:</strong> Estás a punto de iniciar un expediente disciplinario para el alumno <strong>{studentLegajo.name}</strong>. Esta acción notificará a la Dirección y Preceptoría.
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del Reporte</label>
                                <input 
                                    type="text"
                                    value={disciplinaryReason}
                                    onChange={(e) => setDisciplinaryReason(e.target.value)}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-white font-medium placeholder-gray-400"
                                    placeholder="Ej. Falta de respeto grave, copia en examen..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Gravedad</label>
                                <select
                                    value={disciplinarySeverity}
                                    onChange={(e) => setDisciplinarySeverity(e.target.value)}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-white font-medium"
                                >
                                    <option value="Leve">Leve</option>
                                    <option value="Moderada">Moderada</option>
                                    <option value="Grave">Grave</option>
                                    <option value="Muy Grave">Muy Grave</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada de los Hechos</label>
                                <textarea 
                                    value={disciplinaryDesc}
                                    onChange={(e) => setDisciplinaryDesc(e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-white font-medium placeholder-gray-400"
                                    placeholder="Describe qué sucedió, dónde y cuándo..."
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button 
                                    onClick={() => setIsDisciplinaryModalOpen(false)}
                                    disabled={isSubmittingReport}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSubmitDisciplinary}
                                    disabled={!disciplinaryReason || !disciplinaryDesc || isSubmittingReport}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingReport ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <FileWarning className="w-4 h-4 mr-2" /> Enviar Reporte
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Panel Docente</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Estudiantes Totales</p>
            <p className="text-2xl font-bold text-gray-800">
                {courses.filter(c => c.status === 'active').reduce((acc, curr) => acc + curr.totalStudents, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Próxima Clase</p>
            <p className="text-xl font-bold text-gray-800">
                {courses.filter(c => c.status === 'active')[0]?.nextClass.split(' ')[1] || '18:00'} HS
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Informes Pendientes</p>
            <p className="text-2xl font-bold text-gray-800">5</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Lesson Planner */}
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden h-fit">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> Asistente de Planificación
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
              <select 
                className="w-full border border-gray-600 bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium"
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
              >
                {careers.map(career => (
                    <option key={career.id} value={career.name}>{career.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año / Curso</label>
              <select 
                className="w-full border border-gray-600 bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {careers.find(c => c.name === selectedCareer)?.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                )) || <option>Seleccione Carrera</option>}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema de la clase</label>
              <input 
                type="text" 
                className="w-full border border-gray-600 bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white font-medium"
                placeholder="ej. Programación Orientada a Objetos, Psicología Evolutiva"
                value={planTopic}
                onChange={(e) => setPlanTopic(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleGeneratePlan}
              disabled={isGenerating || !planTopic}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-300 flex justify-center items-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </>
              ) : (
                <>Generar Planificación</>
              )}
            </button>

            {generatedPlan && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Resultado:</h4>
                <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">
                  {generatedPlan}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Courses List (Live) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-gray-600" /> Mis Cursos Asignados
            </h3>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setCourseFilter('active')}
                className={`flex-1 py-3 text-sm font-medium text-center transition ${courseFilter === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Activos
            </button>
            <button 
                onClick={() => setCourseFilter('archived')}
                className={`flex-1 py-3 text-sm font-medium text-center transition ${courseFilter === 'archived' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Archivados
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {displayedCourses.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                    <Archive className="w-8 h-8 mb-2 text-gray-300" />
                    No hay cursos {courseFilter === 'active' ? 'activos' : 'archivados'}.
                </div>
            ) : (
                displayedCourses.map((course) => (
                    <div key={course.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group relative">
                        <div onClick={() => setSelectedCourse(course)} className="cursor-pointer flex-1">
                            <p className="font-medium text-gray-900">{course.name}</p>
                            <p className="text-xs text-gray-500">{course.career}</p>
                            <div className="flex items-center mt-1 space-x-3">
                                <span className="text-xs text-gray-400 flex items-center">
                                    <Users className="w-3 h-3 mr-1" /> {course.totalStudents}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                    {course.year}
                                </span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-2 pl-4">
                             {course.status === 'active' && (
                                <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                                    {course.nextClass}
                                </span>
                             )}
                             <div className="flex items-center space-x-1">
                                <button 
                                    onClick={(e) => handleToggleArchive(e, course.id)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                                    title={course.status === 'active' ? "Archivar Curso" : "Restaurar Curso"}
                                >
                                    {course.status === 'active' ? <Archive className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => setSelectedCourse(course)}
                                    className="text-indigo-600 text-sm font-medium hover:text-indigo-800 hover:underline"
                                >
                                    Ver
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;