
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Persona } from '../types.ts';
import { geminiService } from '../services/geminiService.ts';

interface Props {
  persona: Persona;
  onEnd: (history: ChatMessage[]) => void;
}

const ChatInterface: React.FC<Props> = ({ persona, onEnd }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        await geminiService.startSimulation(persona);
        const welcomeMsg = await geminiService.sendMessage("성과를 나열하지 말고, 팀장님께 면담 준비가 되었다는 인사만 짧게 건네주세요.");
        setMessages([{ role: 'model', text: welcomeMsg }]);
      } catch (error: any) {
        console.error(error);
        const errorText = error.message?.includes("quota") 
          ? "현재 AI 사용량이 많아 잠시 대화가 어렵습니다. 1분 후 다시 시도해주세요." 
          : "시뮬레이션을 시작하는 중 오류가 발생했습니다.";
        setMessages([{ role: 'model', text: errorText }]);
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [persona]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (input.includes("대화 종료") || input.includes("평가해줘")) {
      onEnd([...messages, userMsg]);
      return;
    }

    try {
      const response = await geminiService.sendMessage(input);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error: any) {
      const errorText = error.message?.includes("quota") 
        ? "죄송합니다. 할당량이 초과되었습니다. 잠시 후(약 1분) 다시 말씀해 주세요." 
        : "오류가 발생했습니다. 다시 시도해주세요.";
      setMessages(prev => [...prev, { role: 'model', text: errorText }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-lg">
            {persona.job.substring(0, 1)}
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">{persona.job} 팀원</h3>
            <p className="text-xs text-slate-300">성과 면담 시뮬레이션 중</p>
          </div>
        </div>
        <button
          onClick={() => onEnd(messages)}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold transition-colors"
        >
          면담 종료 및 평가
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 chat-scrollbar bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
              msg.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2 flex space-x-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm placeholder-slate-400"
            placeholder="팀원에게 질문을 건네보세요... (종료시 '대화 종료' 입력)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-md shadow-indigo-100 disabled:bg-slate-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 text-center font-medium">
          피드백 프로세스 <span className="text-indigo-600 font-bold">FIRN</span>을 활용하여 성과를 확인하는 개방형 질문을 통해 소통해보세요
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
