
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { getMentorResponse } from '../services/gemini';

interface ChatMessage {
  role: 'user' | 'mentor';
  text: string;
}

const Mentor: React.FC<{ user: User }> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'mentor', text: `Olá, ${user.name}! Sou o Mentor Emaús. O que te traz aqui hoje? Queres estudar algum versículo ou tens alguma dúvida no coração?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    const aiResponse = await getMentorResponse(userMsg);
    
    setMessages(prev => [...prev, { role: 'mentor', text: aiResponse }]);
    setIsTyping(false);
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pb-4" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-sm leading-relaxed text-sm font-medium border-2 ${
                msg.role === 'user'
                  ? 'bg-[#3533cd] text-white rounded-tr-none border-[#3533cd] shadow-blue-500/10'
                  : 'bg-slate-50 text-slate-800 rounded-tl-none border-[#3533cd]/20'
              }`}
            >
              {msg.role === 'mentor' && (
                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-[#3533cd]">
                  <i className="fa-solid fa-dove"></i>
                  Mentor Emaús
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 p-3 md:p-4 rounded-2xl rounded-tl-none border-2 border-[#3533cd]/10">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#3533cd] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#3533cd] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-[#3533cd] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 md:mt-8 relative group pb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunta à Bíblia..."
          className="w-full bg-white border-2 border-[#3533cd] rounded-2xl md:rounded-[2rem] px-5 py-4 md:px-8 md:py-5 pr-14 md:pr-20 focus:outline-none focus:ring-4 focus:ring-[#3533cd]/10 transition-all text-black text-sm md:text-base font-bold shadow-lg shadow-blue-500/5 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isTyping}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-[#3533cd] hover:bg-blue-700 active:bg-blue-800 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30 active:scale-90 z-10"
        >
          <i className="fa-solid fa-paper-plane text-xs md:text-base"></i>
        </button>
      </form>
    </div>
  );
};

export default Mentor;
