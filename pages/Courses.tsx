
import React, { useState } from 'react';
import { User, UserRole, Course } from '../types';
import { supabase } from '../services/supabase';

interface CoursesProps {
  user: User;
  courses: Course[];
  onAddCourse: (course: Course) => void;
  refreshCourses?: () => void;
}

const Courses: React.FC<CoursesProps> = ({ user, courses, onAddCourse, refreshCourses }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: newTitle,
            description: newDesc || 'Novo curso adicionado pelo gestor para a comunidade.',
            youtube_url: newUrl,
            thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        const createdCourse: Course = {
          id: data[0].id.toString(),
          title: data[0].title,
          description: data[0].description,
          youtubeUrl: data[0].youtube_url,
          thumbnail: data[0].thumbnail
        };
        onAddCourse(createdCourse);
        if (refreshCourses) refreshCourses();
        setShowAddModal(false);
        setNewTitle('');
        setNewUrl('');
        setNewDesc('');
      }
    } catch (error) {
      console.error("Erro ao adicionar curso:", error);
      alert("Erro ao adicionar curso. Verifique se tem permissão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-black">Cursos Bíblicos</h1>
          <p className="text-slate-400 font-medium mt-1">Aprofunda o teu conhecimento na Palavra de Deus.</p>
        </div>
        {user.role === UserRole.ADMIN && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#3533cd] hover:bg-blue-700 active:bg-blue-800 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 active:scale-90"
          >
            <i className="fa-solid fa-plus"></i>
            Novo Curso
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-400 font-medium">
            Nenhum curso disponível no momento.
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="emaus-card rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
              <div className="aspect-video relative overflow-hidden bg-slate-900">
                <iframe
                  src={course.youtubeUrl}
                  title={course.title}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-black text-black mb-3 group-hover:text-[#3533cd] transition-colors">{course.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-2">{course.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-3xl font-black text-black mb-8">Adicionar Novo Curso</h2>
            <form onSubmit={handleAddCourse} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título do Estudo</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                  placeholder="Ex: Vida de Paulo"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#3533cd] focus:outline-none h-24 resize-none"
                  placeholder="Resumo do curso..."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link do YouTube (Embed)</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-slate-400 font-bold hover:text-black py-4 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#3533cd] hover:bg-blue-700 active:bg-blue-800 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 active:scale-90 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? 'Salvando...' : 'Publicar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
