import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, MapPin, FileText } from 'lucide-react';
import { CalendarEvent, UserRole, User } from '../types';
import { getEvents, addEvent, deleteEvent } from '../services/mockDatabase';

interface CalendarViewProps {
  currentUser: User;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('other');
  const [newEventDesc, setNewEventDesc] = useState('');

  useEffect(() => {
    refreshEvents();
  }, []);

  const refreshEvents = () => {
    setEvents(getEvents());
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    // Format date as YYYY-MM-DD considering timezone offset fix or just simple slice
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    addEvent({
      title: newEventTitle,
      type: newEventType,
      date: dateStr,
      description: newEventDesc
    });

    setNewEventTitle('');
    setNewEventDesc('');
    setIsModalOpen(false);
    refreshEvents();
  };

  const handleDeleteEvent = (id: string) => {
      if(window.confirm("¿Eliminar este evento?")) {
          deleteEvent(id);
          refreshEvents();
      }
  }

  const renderCalendarCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div 
            key={day} 
            onClick={() => {
                setSelectedDate(new Date(year, month, day));
                // Only allow admins, teachers or directors to add events
                if(currentUser.role !== UserRole.ALUMNO) {
                    setIsModalOpen(true);
                }
            }}
            className={`h-24 md:h-32 border border-gray-100 p-2 transition hover:bg-gray-50 cursor-pointer relative group ${isToday ? 'bg-indigo-50' : 'bg-white'}`}
        >
          <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
            {day}
          </span>
          
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                title={event.title}
                className={`text-xs px-1.5 py-0.5 rounded truncate font-medium border-l-2 
                  ${event.type === 'exam' ? 'bg-red-100 text-red-800 border-red-500' : 
                    event.type === 'holiday' ? 'bg-green-100 text-green-800 border-green-500' :
                    event.type === 'deadline' ? 'bg-yellow-100 text-yellow-800 border-yellow-500' :
                    'bg-blue-100 text-blue-800 border-blue-500'}`}
              >
                {event.title}
              </div>
            ))}
          </div>

          {/* Add Button visual cue on hover */}
          {currentUser.role !== UserRole.ALUMNO && (
               <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition">
                   <div className="bg-gray-200 p-1 rounded-full">
                       <Plus className="w-3 h-3 text-gray-600" />
                   </div>
               </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
          <CalendarIcon className="w-6 h-6 mr-2 text-indigo-600" /> 
          Calendario Académico
        </h2>
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-medium text-gray-900 w-32 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-gray-500 uppercase">
              {day}
            </div>
          ))}
        </div>
        {/* Days Cells */}
        <div className="grid grid-cols-7">
          {renderCalendarCells()}
        </div>
      </div>

      {/* Upcoming Events List (Mobile friendly summary) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Eventos del Mes</h3>
        <div className="space-y-2">
            {events
                .filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`))
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full 
                             ${event.type === 'exam' ? 'bg-red-500' : 
                               event.type === 'holiday' ? 'bg-green-500' :
                               event.type === 'deadline' ? 'bg-yellow-500' :
                               'bg-blue-500'}`} 
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.date} • {event.description || event.type}</p>
                        </div>
                    </div>
                    {currentUser.role !== UserRole.ALUMNO && (
                        <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
            {events.filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)).length === 0 && (
                <p className="text-sm text-gray-400 italic">No hay eventos programados para este mes.</p>
            )}
        </div>
      </div>

      {/* Modal Add Event */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Nuevo Evento - {selectedDate.toLocaleDateString()}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Evento</label>
                <input 
                  type="text" required
                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="Ej. Examen Final Historia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium"
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value as any)}
                >
                  <option value="other">General</option>
                  <option value="exam">Examen / Parcial</option>
                  <option value="deadline">Entrega TP</option>
                  <option value="holiday">Feriado</option>
                  <option value="meeting">Reunión</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea 
                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-medium placeholder-gray-400"
                  rows={3}
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;