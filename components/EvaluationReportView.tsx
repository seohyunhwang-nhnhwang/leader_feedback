
import React, { useState, useRef } from 'react';
import { EvaluationReport } from '../types.ts';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  report: EvaluationReport;
  onRestart: () => void;
}

declare global {
  interface Window {
    html2pdf: any;
  }
}

const EvaluationReportView: React.FC<Props> = ({ report, onRestart }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const chartData = [
    { subject: 'Fact', A: report.firn_score.F, full: 20 },
    { subject: 'Impact', A: report.firn_score.I, full: 20 },
    { subject: 'Request', A: report.firn_score.R, full: 20 },
    { subject: 'New Impact', A: report.firn_score.N, full: 20 },
    { subject: 'Manner', A: report.firn_score.Manner, full: 20 },
  ];

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;

    setIsDownloading(true);
    
    // 버튼 등을 숨기기 위해 클래스 추가 또는 별도 엘리먼트 캡처
    const element = reportRef.current;
    
    const opt = {
      margin: 10,
      filename: `Feedback_Report_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 1200 // 고정 너비로 캡처하여 레이아웃 깨짐 방지
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Recharts 애니메이션 완료를 기다리기 위해 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 500));
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div ref={reportRef} className="bg-slate-50 rounded-2xl overflow-hidden p-1">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Analysis Report</span>
                <span className="text-slate-400 text-xs">{new Date().toLocaleDateString()}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">성과 면담 코칭 리포트</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-md">
                Gemini 3 Pro AI가 FIRN 피드백 모델에 기반하여 리더님의 면담 스킬을 분석했습니다.
              </p>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100 min-w-[160px]">
              <span className="text-xs font-bold opacity-80 mb-1">총점</span>
              <div className="flex items-baseline">
                <span className="text-5xl font-black">{report.totalScore}</span>
                <span className="text-indigo-200 font-bold ml-1 text-lg">/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-10 items-center">
            {/* Chart Area */}
            <div className="h-72 w-full bg-slate-50/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="#4f46e5"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Area */}
            <div className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 text-slate-800 font-bold mb-3">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  종합 요약
                </h4>
                <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl text-slate-700 text-sm leading-relaxed">
                  {report.summary}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h5 className="font-bold text-emerald-600 flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              핵심 강점 (Key Strengths)
            </h5>
            <ul className="space-y-3">
              {report.good_points.map((pt, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex gap-3 items-start">
                  <span className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h5 className="font-bold text-amber-600 flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              개선 제안 (Action Items)
            </h5>
            <ul className="space-y-3">
              {report.improvement_points.map((pt, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex gap-3 items-start">
                  <span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Final Advice */}
        <div className="mt-6 bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Expert's Advice
            </h4>
            <p className="text-indigo-100/90 leading-relaxed text-sm">
              {report.overall_comment}
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 no-print">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-lg ${
            isDownloading ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          {isDownloading ? (
             <svg className="animate-spin h-5 w-5 text-slate-500" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {isDownloading ? 'PDF 생성 중...' : '결과 리포트 다운로드 (PDF)'}
        </button>
        <button
          onClick={onRestart}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-200"
        >
          새 시뮬레이션 시작
        </button>
      </div>
    </div>
  );
};

export default EvaluationReportView;