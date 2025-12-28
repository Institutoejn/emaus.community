
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
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data (Session & Courses)
  useEffect(() => {
    const initApp = async () => {
      // 1. Check active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }

      // 2. Fetch Courses
      await fetchCourses();

      // 3. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      });

      setLoading(false);
      return () => subscription.unsubscribe();
    };

    initApp();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        // Mapeamento Correto: DB (snake_case) -> App (camelCase)
        setUser({
          id: data.id,
          name: data.name,
          username: data.username,
          email: data.email,
          interest: data.interest,
          role: data.role as UserRole,
          createdAt: new Date(data.created_at).getTime(),
          avatarUrl: data.avatar_url, // Importante: mapeia avatar_url para avatarUrl
          phone: data.phone,
          bio: data.bio
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        const mappedCourses: Course[] = data.map((c: any) => ({
          id: c.id.toString(),
          title: c.title,
          description: c.description,
          youtubeUrl: c.youtube_url,
          thumbnail: c.thumbnail
        }));
        setCourses(mappedCourses);
      }
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    }
  };

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses([newCourse, ...courses]);
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
            <Route path="/courses" element={<Courses user={user} courses={courses} onAddCourse={handleAddCourse} refreshCourses={fetchCourses} />} />
            <Route path="/community" element={<Community user={user} />} />
            <Route path="/profile" element={<Profile user={user} onUpdate={handleUpdateUser} />} />
            {user.role === UserRole.ADMIN && (
              <Route path="/admin" element={<Dashboard courses={courses} onAddCourse={handleAddCourse} refreshCourses={fetchCourses} />} />
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
