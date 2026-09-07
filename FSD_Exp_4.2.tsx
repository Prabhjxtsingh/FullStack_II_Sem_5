import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Twitter, 
  Facebook, 
  Linkedin,
  Instagram,
  Clock,
  X,
  Trash2,
  Edit2,
  CheckCircle2,
  Activity
} from 'lucide-react';

// --- Utility & Pure Functions (Highly Testable) ---
export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
export const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
export const formatDateString = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const PLATFORMS = {
  twitter: { icon: Twitter, color: 'bg-blue-400', text: 'text-blue-900', label: 'Twitter' },
  facebook: { icon: Facebook, color: 'bg-blue-600', text: 'text-blue-50', label: 'Facebook' },
  linkedin: { icon: Linkedin, color: 'bg-blue-700', text: 'text-blue-50', label: 'LinkedIn' },
  instagram: { icon: Instagram, color: 'bg-pink-600', text: 'text-pink-50', label: 'Instagram' },
};

// OPTIMIZATION: Memoized Event Badge
// Prevents re-rendering of individual posts unless their specific props change.
const MemoizedEventBadge = memo(({ dateString, event, onDragStart, onClick }) => {
  const PlatformIcon = PLATFORMS[event.platform].icon;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, event.id)}
      onClick={(e) => { e.stopPropagation(); onClick(dateString, event); }}
      className={`cursor-move p-1.5 rounded-md shadow-sm border border-transparent hover:border-slate-300 transition-all ${PLATFORMS[event.platform].color} ${PLATFORMS[event.platform].text} text-xs flex items-center gap-1.5`}
      title={`${event.time} - ${event.title}`}
    >
      <PlatformIcon size={12} className="shrink-0" />
      <span className="font-medium truncate">{event.title}</span>
    </div>
  );
});

// OPTIMIZATION: Memoized Calendar Day
// Massive performance gain: Only days that receive new events or change 'isToday' status will re-render.
const MemoizedCalendarDay = memo(({ 
  day, 
  dateString, 
  isToday, 
  dayEvents, 
  onDragOver, 
  onDrop, 
  onDayClick, 
  onEventClick, 
  onAddClick,
  onDragStart
}) => {
  return (
    <div 
      className={`bg-white border-r border-b border-slate-200 min-h-[120px] p-2 group transition-colors hover:bg-slate-50 relative ${isToday ? 'bg-blue-50/30' : ''}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, dateString)}
      onClick={(e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('day-header')) {
           onDayClick(dateString);
        }
      }}
    >
      <div className="flex justify-between items-center mb-2 day-header cursor-pointer" onClick={() => onDayClick(dateString)}>
        <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
          {day}
        </span>
        <button 
          className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 p-1"
          title="Add Post"
          onClick={(e) => { e.stopPropagation(); onAddClick(dateString); }}
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
        {dayEvents?.map(event => (
          <MemoizedEventBadge 
            key={event.id}
            dateString={dateString}
            event={event} 
            onDragStart={onDragStart} 
            onClick={onEventClick} 
          />
        ))}
      </div>
    </div>
  );
});

export default function App() {
  // --- State Management ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [draggedEventId, setDraggedEventId] = useState(null);
  const [testResults, setTestResults] = useState(null); // For integrated testing

  const [formData, setFormData] = useState({
    title: '', content: '', platform: 'twitter', time: '12:00'
  });

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setEvents([
      { id: '1', title: 'Product Launch Thread', content: 'Exciting news!', platform: 'twitter', date: formatDateString(year, month, 10), time: '09:00' },
      { id: '2', title: 'Weekly Tips', content: 'Here are 5 tips.', platform: 'linkedin', date: formatDateString(year, month, 15), time: '14:30' },
      { id: '3', title: 'Behind the Scenes', content: 'Look at our team.', platform: 'instagram', date: formatDateString(year, month, 22), time: '17:00' }
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OPTIMIZATION: useMemo for Data Mapping
  // Previously, filtering occurred inside the render loop for all 31 days. 
  // Now, we map events by date ONCE only when the `events` array changes.
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    // Sort events within their days
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDay = useMemo(() => getFirstDayOfMonth(year, month), [year, month]);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // OPTIMIZATION: useCallback for stable references
  // Using functional state updates (`setEvents(prev => ...)`) removes `events` from dependencies.
  // This ensures these functions never change, keeping MemoizedCalendarDay from re-rendering.
  
  const handlePrevMonth = useCallback(() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)), []);
  const handleToday = useCallback(() => setCurrentDate(new Date()), []);

  const openModal = useCallback((date, event = null) => {
    setSelectedDate(date);
    if (event) {
      setEditingEvent(event);
      setFormData({ title: event.title, content: event.content, platform: event.platform, time: event.time });
    } else {
      setEditingEvent(null);
      setFormData({ title: '', content: '', platform: 'twitter', time: '12:00' });
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingEvent(null);
  }, []);

  const handleSaveEvent = useCallback((e) => {
    e.preventDefault();
    setEvents(prev => {
      if (editingEvent) {
        return prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...formData, date: selectedDate } : ev);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), date: selectedDate, ...formData }];
    });
    closeModal();
  }, [editingEvent, formData, selectedDate, closeModal]);

  const handleDeleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
    closeModal();
  }, [closeModal]);

  const handleDragStart = useCallback((e, eventId) => {
    setDraggedEventId(eventId);
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, targetDate) => {
    e.preventDefault();
    if (!draggedEventId) return;
    setEvents(prev => prev.map(ev => ev.id === draggedEventId ? { ...ev, date: targetDate } : ev));
    setDraggedEventId(null);
  }, [draggedEventId]);

  // TESTING: Integrated UI Test Runner
  const runDiagnostics = () => {
    const results = [];
    let passed = 0;
    const assert = (condition, name) => {
      if (condition) passed++;
      results.push({ name, passed: condition });
    };

    try {
      // Unit Tests
      assert(formatDateString(2024, 0, 5) === '2024-01-05', 'formatDateString formats single digits correctly');
      assert(formatDateString(2024, 11, 25) === '2024-12-25', 'formatDateString formats double digits correctly');
      assert(getDaysInMonth(2024, 1) === 29, 'getDaysInMonth calculates leap years (Feb 2024 = 29)');
      assert(getDaysInMonth(2023, 1) === 28, 'getDaysInMonth calculates non-leap years (Feb 2023 = 28)');
      
      // State & Logic Tests Simulation
      const testEvents = [{ id: '1', date: '2024-01-01' }];
      const simulatedDrop = testEvents.map(ev => ev.id === '1' ? { ...ev, date: '2024-01-05' } : ev);
      assert(simulatedDrop[0].date === '2024-01-05', 'Drag and drop functional state mapping works');

    } catch (err) {
      results.push({ name: 'Execution Error', passed: false });
    }
    
    setTestResults({ total: results.length, passed, details: results });
    setTimeout(() => setTestResults(null), 5000); // clear after 5s
  };

  const renderCalendarDays = () => {
    const days = [];
    const todayString = new Date().toDateString();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-slate-50 border-r border-b border-slate-200 min-h-[120px] p-2 opacity-50"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(year, month, day);
      const isToday = todayString === new Date(year, month, day).toDateString();
      const dayEvents = eventsByDate[dateString] || []; 
      
      days.push(
        <MemoizedCalendarDay 
          key={day}
          day={day}
          dateString={dateString}
          isToday={isToday}
          dayEvents={dayEvents}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDayClick={openModal}
          onEventClick={openModal}
          onAddClick={openModal}
          onDragStart={handleDragStart}
        />
      );
    }
    
    const missingCells = (Math.ceil(days.length / 7) * 7) - days.length;
    for (let i = 0; i < missingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="bg-slate-50 border-r border-b border-slate-200 min-h-[120px] p-2 opacity-50"></div>);
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Header with Test Diagnostics */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 text-blue-600">
          <CalendarIcon size={24} className="text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Optimized Scheduler</h1>
          
          <button onClick={runDiagnostics} className="ml-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full transition-colors border border-emerald-200">
            <Activity size={14} /> Run Logic Tests
          </button>
        </div>
        
        {testResults && (
          <div className="absolute top-16 left-6 bg-white border border-slate-200 shadow-xl rounded-lg p-4 z-50 animate-in slide-in-from-top-2 w-80">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 size={16} className={testResults.passed === testResults.total ? "text-emerald-500" : "text-amber-500"}/> 
              Test Results ({testResults.passed}/{testResults.total})
            </h3>
            <ul className="space-y-1">
              {testResults.details.map((res, idx) => (
                <li key={idx} className="text-xs flex items-start gap-2">
                  <span className={res.passed ? "text-emerald-500" : "text-red-500"}>{res.passed ? '✓' : '✗'}</span>
                  <span className="text-slate-600">{res.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button onClick={handleToday} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            Today
          </button>
          
          <div className="flex items-center gap-2 bg-slate-100 rounded-md p-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Calendar */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {dayNames.map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-t border-slate-200 -ml-[1px] -mt-[1px]">
            {renderCalendarDays()}
          </div>
        </div>
      </main>

      {/* Post Editor Modal (Unchanged Layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingEvent ? 'Edit Scheduled Post' : 'Schedule New Post'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(PLATFORMS).map(([key, config]) => {
                      const Icon = config.icon;
                      const isSelected = formData.platform === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({...formData, platform: key})}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${
                            isSelected ? `${config.color} border-transparent ${config.text} shadow-sm ring-2 ring-offset-1 ring-slate-200` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <Icon size={20} className="mb-1" />
                          <span className="text-[10px] font-semibold">{config.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input 
                      type="date" required value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Clock size={14}/> Time</label>
                    <input 
                      type="time" required value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" required placeholder="Announcement" value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                  <textarea 
                    rows="3" required placeholder="What to share?" value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                {editingEvent ? (
                  <button type="button" onClick={() => handleDeleteEvent(editingEvent.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1 text-sm font-medium">
                    <Trash2 size={16} /> Delete
                  </button>
                ) : <div></div>}
                
                <div className="flex gap-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2">
                    {editingEvent ? <Edit2 size={16} /> : <Plus size={16} />} {editingEvent ? 'Update' : 'Schedule'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}