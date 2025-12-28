
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Mentor from './pages/Mentor';
import Courses from './pages/Courses';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { User, UserRole, Course } from './types';

const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'A Jornada de Fé',
    description: 'Como começar a tua caminhada com Cristo de forma sólida e perseverante.',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/bible/600/400'
  },
  {
    id: '2',
    title: 'Interpretando Parábolas',
    description: 'Descobre os mistérios por trás das histórias que Jesus contou aos seus discípulos.',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/jesus/600/400'
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('emaus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedCourses = localStorage.getItem('emaus_courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(INITIAL_COURSES);
      localStorage.setItem('emaus_courses', JSON.stringify(INITIAL_COURSES));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (mockUser: User) => {
    setUser(mockUser);
    localStorage.setItem('emaus_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('emaus_user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('emaus_user', JSON.stringify(updatedUser));
  };

  const handleAddCourse = (newCourse: Course) => {
    const updated = [newCourse, ...courses];
    setCourses(updated);
    localStorage.setItem('emaus_courses', JSON.stringify(updated));
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center emaus-gradient">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        {user ? (
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home user={user} />} />
            <Route path="/mentor" element={<Mentor user={user} />} />
            <Route path="/courses" element={<Courses user={user} courses={courses} onAddCourse={handleAddCourse} />} />
            <Route path="/community" element={<Community user={user} />} />
            <Route path="/profile" element={<Profile user={user} onUpdate={handleUpdateUser} />} />
            {user.role === UserRole.ADMIN && (
              <Route path="/admin" element={<Dashboard courses={courses} onAddCourse={handleAddCourse} />} />
            )}
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
