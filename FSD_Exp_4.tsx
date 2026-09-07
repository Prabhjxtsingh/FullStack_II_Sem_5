import React, { useState, useReducer, createContext, useContext } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Twitter, 
  Linkedin, 
  Instagram,
  X,
  Trash2,
  GripVertical
} from 'lucide-react';


// -------------------------------------------------------------------
// 1. STATE MANAGEMENT (Redux-lite using Context + useReducer)
// -------------------------------------------------------------------

// Mock Initial Data
const initialPosts = [
  { id: '1', title: 'Product Launch Announcement', date: '2026-09-10', time: '09:00', platform: 'linkedin', color: 'bg-blue-600' },
  { id: '2', title: 'Behind the Scenes', date: '2026-09-15', time: '14:30', platform: 'instagram', color: 'bg-pink-600' },
  { id: '3', title: 'Weekly Tips', date: '2026-09-15', time: '10:00', platform: 'twitter', color: 'bg-sky-500' },
  { id: '4', title: 'Customer Spotlight', date: '2026-09-22', time: '11:00', platform: 'linkedin', color: 'bg-blue-600' },
];

const PostContext = createContext();

const postReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_POST':
      return [...state, action.payload];
    case 'UPDATE_POST':
      return state.map(post => post.id === action.payload.id ? action.payload : post);
    case 'MOVE_POST':
      // Specifically for drag-and-drop
      return state.map(post => 
        post.id === action.payload.id 
          ? { ...post, date: action.payload.newDate } 
          : post
      );
    case 'DELETE_POST':
      return state.filter(post => post.id !== action.payload);
    default:
      return state;
  }
};

const PostProvider = ({ children }) => {
  const [posts, dispatch] = useReducer(postReducer, initialPosts);

  return (
    <PostContext.Provider value={{ posts, dispatch }}>
      {children}
    </PostContext.Provider>
  );
};

const usePosts = () => useContext(PostContext);


// -------------------------------------------------------------------
// 2. CALENDAR UTILITIES
// -------------------------------------------------------------------

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PLATFORMS = {
  twitter: { icon: Twitter, color: 'bg-sky-500' },
  linkedin: { icon: Linkedin, color: 'bg-blue-600' },
  instagram: { icon: Instagram, color: 'bg-pink-600' },
};

// Formats date to YYYY-MM-DD for easy string comparison
const formatDate = (year, month, day) => {
  const m = (month + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// Generates the grid layout for the calendar
const generateCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const grid = [];
  
  // Previous month padded days
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
      dateString: formatDate(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, daysInPrevMonth - i)
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
      dateString: formatDate(year, month, i)
    });
  }
  
  // Next month padded days (to complete the 35 or 42 cell grid)
  const remainingCells = 42 - grid.length; // Ensure 6 rows for visual consistency
  for (let i = 1; i <= remainingCells; i++) {
    grid.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
      dateString: formatDate(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i)
    });
  }
  
  return grid;
};


// -------------------------------------------------------------------
// 3. UI COMPONENTS
// -------------------------------------------------------------------

// Component: Draggable Post Item
const ScheduledPost = ({ post, onClick }) => {
  const PlatformIcon = PLATFORMS[post.platform]?.icon || CalendarIcon;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('postId', post.id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag ghost to generate before making the original semi-transparent
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => { e.stopPropagation(); onClick(post); }}
      className={`${post.color} text-white text-xs p-1.5 rounded-md mb-1 cursor-pointer shadow-sm hover:opacity-90 flex items-center gap-1.5 transition-opacity group`}
      title={`${post.time} - ${post.title}`}
    >
      <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block shrink-0" />
      <PlatformIcon className="h-3 w-3 shrink-0" />
      <span className="truncate flex-1">{post.title}</span>
    </div>
  );
};

// Component: Individual Day Cell in the Grid
const CalendarCell = ({ dayData, dayPosts, onDateClick, onPostClick }) => {
  const { dispatch } = usePosts();
  const [isDragOver, setIsDragOver] = useState(false);

  // Drag and Drop Handlers for the Cell
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const postId = e.dataTransfer.getData('postId');
    
    if (postId) {
      dispatch({ 
        type: 'MOVE_POST', 
        payload: { id: postId, newDate: dayData.dateString } 
      });
    }
  };

  // Check if cell is today
  const isToday = dayData.dateString === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div 
      onClick={() => onDateClick(dayData.dateString)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        min-h-[100px] sm:min-h-[120px] p-2 border-r border-b border-gray-200 transition-colors relative group
        ${!dayData.isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'} 
        ${isDragOver ? 'bg-indigo-50 ring-2 ring-indigo-400 ring-inset' : 'hover:bg-slate-50 cursor-pointer'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`
          text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full
          ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}
        `}>
          {dayData.day}
        </span>
        
        {/* Quick Add Button on Hover */}
        <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition-opacity">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-[80px] sm:max-h-[100px] overflow-y-auto no-scrollbar">
        {dayPosts
          .sort((a, b) => a.time.localeCompare(b.time))
          .map(post => (
            <ScheduledPost key={post.id} post={post} onClick={onPostClick} />
        ))}
      </div>
    </div>
  );
};


// Component: Post Add/Edit Modal
const PostModal = ({ isOpen, onClose, selectedDate, existingPost }) => {
  const { dispatch } = usePosts();
  
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate || '',
    time: '12:00',
    platform: 'twitter'
  });

  // Sync form data when modal opens with existing post or new date
  React.useEffect(() => {
    if (existingPost) {
      setFormData(existingPost);
    } else {
      setFormData({
        title: '',
        date: selectedDate || '',
        time: '12:00',
        platform: 'twitter'
      });
    }
  }, [existingPost, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (existingPost) {
      dispatch({ type: 'UPDATE_POST', payload: { ...formData, id: existingPost.id, color: PLATFORMS[formData.platform].color } });
    } else {
      dispatch({ 
        type: 'ADD_POST', 
        payload: { 
          ...formData, 
          id: Date.now().toString(),
          color: PLATFORMS[formData.platform].color 
        } 
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingPost && window.confirm('Are you sure you want to delete this post?')) {
      dispatch({ type: 'DELETE_POST', payload: existingPost.id });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            {existingPost ? 'Edit Scheduled Post' : 'Schedule New Post'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content / Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g., Exciting news coming tomorrow..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full rounded-lg border-gray-300 border px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full rounded-lg border-gray-300 border px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <div className="flex gap-3">
              {Object.keys(PLATFORMS).map(platform => (
                <label key={platform} className={`
                  flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${formData.platform === platform ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
                `}>
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={formData.platform === platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    className="sr-only"
                  />
                  {React.createElement(PLATFORMS[platform].icon, { 
                    className: `h-6 w-6 mb-1 ${formData.platform === platform ? 'text-indigo-600' : 'text-gray-500'}` 
                  })}
                  <span className={`text-xs font-medium capitalize ${formData.platform === platform ? 'text-indigo-800' : 'text-gray-600'}`}>
                    {platform}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-between gap-3 border-t border-gray-100 mt-6">
            {existingPost ? (
              <button 
                type="button" 
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            ) : <div></div>}
            
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                {existingPost ? 'Save Changes' : 'Schedule Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


// -------------------------------------------------------------------
// 4. MAIN CALENDAR APPLICATION
// -------------------------------------------------------------------
const CalendarApp = () => {
  const { posts } = usePosts();
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Started at Sept 2026 for demo data
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate the Grid layout
  const grid = generateCalendarGrid(currentYear, currentMonth);

  // Handlers for month navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Modals Interactions
  const handleDateClick = (dateString) => {
    setSelectedDate(dateString);
    setEditingPost(null);
    setModalOpen(true);
  };

  const handlePostClick = (post) => {
    setEditingPost(post);
    setSelectedDate(post.date);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-sm">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-sm text-gray-500">Drag and drop posts to reschedule</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-200">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="px-4 py-2 font-semibold text-gray-800 min-w-[140px] text-center bg-white flex items-center justify-center">
                {MONTHS[currentMonth]} {currentYear}
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-200">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <button 
              onClick={goToToday}
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm hidden sm:block"
            >
              Today
            </button>
            
            <button 
              onClick={() => handleDateClick(formatDate(currentYear, currentMonth, new Date().getDate()))}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
            {DAYS_OF_WEEK.map((day, i) => (
              <div key={day} className={`
                py-3 text-center text-xs sm:text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0
                ${(i === 0 || i === 6) ? 'text-indigo-600' : ''}
              `}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Cells */}
          <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
            {grid.map((cell, index) => {
              // Filter posts that belong to this specific date
              const dayPosts = posts.filter(post => post.date === cell.dateString);
              
              return (
                <CalendarCell 
                  key={`${cell.month}-${cell.day}-${index}`}
                  dayData={cell}
                  dayPosts={dayPosts}
                  onDateClick={handleDateClick}
                  onPostClick={handlePostClick}
                />
              );
            })}
          </div>
        </div>

        {/* Global Modal */}
        <PostModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          selectedDate={selectedDate}
          existingPost={editingPost}
        />

      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 5. ROOT COMPONENT EXPORT
// -------------------------------------------------------------------
export default function App() {
  return (
    <PostProvider>
      <CalendarApp />
    </PostProvider>
  );
}