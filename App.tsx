
import React, { useState } from 'react';
import { AppPhase, Persona, ChatMessage, EvaluationReport } from './types';
import PersonaForm from './components/PersonaForm';
import ChatInterface from './components/ChatInterface';
import EvaluationReportView from './components/EvaluationReportView';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.SETUP);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartChat = (selectedPersona: Persona) => {
    setPersona(selectedPersona);
    setPhase(AppPhase.CHAT);
  };

  const handleEndChat = async (history: ChatMessage[]) => {
    setIsAnalyzing(true);
    try {
      const result = await geminiService.generateReport(history);
      setReport(result);
      setPhase(AppPhase.REPORT);
    } catch (error) {
      alert("평가 리포트를 생성하는 중 오류가 발생했습니다.");
      setPhase(AppPhase.SETUP);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setPersona(null);
    setReport(null);
    setPhase(AppPhase.SETUP);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            Performance Review Simulator
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${phase === AppPhase.SETUP ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>1. Setup</span>
          <span className="text-slate-300">→</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${phase === AppPhase.CHAT ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>2. Interview</span>
          <span className="text-slate-300">→</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${phase === AppPhase.REPORT ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>3. Report</span>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8">
        {phase === AppPhase.SETUP && <PersonaForm onSubmit={handleStartChat} />}
        
        {phase === AppPhase.CHAT && persona && (
          <div className="max-w-4xl mx-auto">
            <ChatInterface persona={persona} onEnd={handleEndChat} />
          </div>
        )}

        {phase === AppPhase.REPORT && report && (
          <EvaluationReportView report={report} onRestart={handleRestart} />
        )}
      </main>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">대화 분석 중...</h3>
            <p className="text-slate-500 text-sm">
              인공지능 성과 관리 전문가가 당신의 코칭 스킬을 꼼꼼하게 분석하고 있습니다. 잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex justify-center items-center text-slate-400 text-xs">
          <div className="flex space-x-4 font-medium">
            <span>Powered by Gemini 3 Pro</span>
            <span className="text-slate-300">|</span>
            <span>FIRN Model Based Feedback</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
