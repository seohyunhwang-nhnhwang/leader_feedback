
import React, { useState, useRef } from 'react';
import { EvaluationReport } from '../types';
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
    { subject: 'Fact (사실)', A: report.firn_score.F, full: 20 },
    { subject: 'Impact (영향)', A: report.firn_score.I, full: 20 },
    { subject: 'Request (요청)', A: report.firn_score.R, full: 20 },
    { subject: 'New Impact (기대)', A: report.firn_score.N, full: 20 },
    { subject: 'Manner (매너)', A: report.firn_score.Manner, full: 20 },
  ];

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;

    setIsDownloading(true);
    
    const element = reportRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Performance_Review_Report_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Create a clone to avoid printing the buttons and styles
      const worker = window.html2pdf().set(opt).from(element).save();
      await worker;
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div ref={reportRef} className="space-y-6 bg-slate-50 p-2 rounded-xl">
        {/* Main Score Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">면담 코칭 리포트 (FIRN)</h2>
              <p className="text-slate-500">행동 중심 피드백 모델 기반 역량 분석 결과입니다.</p>
            </div>
            <div className="mt-4 md:mt-0 bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
              <span className="text-sm font-bold text-indigo-600 block mb-1">Total Score</span>
              <span className="text-4xl font-black text-indigo-700">{report.totalScore}</span>
              <span className="text-indigo-400 font-bold ml-1">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 border-l-4 border-indigo-500 pl-3">면담 요약</h4>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg">
                {report.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
            <h5 className="font-bold text-emerald-600 flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              잘한 점 (Good Points)
            </h5>
            <ul className="space-y-2">
              {report.good_points.map((pt, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex gap-2">
                  <span className="text-emerald-500 font-bold">•</span> {pt}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
            <h5 className="font-bold text-amber-600 flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              개선점 및 제안 (Improvement)
            </h5>
            <ul className="space-y-2">
              {report.improvement_points.map((pt, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex gap-2">
                  <span className="text-amber-500 font-bold">•</span> {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Advice Card */}
        <div className="bg-indigo-900 text-indigo-50 p-6 rounded-xl shadow-lg">
          <h4 className="font-bold text-lg mb-2">리더를 위한 최종 조언</h4>
          <p className="text-sm leading-relaxed opacity-90">{report.overall_comment}</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center items-center gap-4 pt-4">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className={`${
            isDownloading ? 'bg-slate-400' : 'bg-slate-800 hover:bg-slate-900'
          } text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2`}
        >
          {isDownloading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {isDownloading ? '파일 생성 중...' : '리포트 즉시 다운로드 (PDF)'}
        </button>
        <button
          onClick={onRestart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-200"
        >
          새로운 시뮬레이션 시작
        </button>
      </div>
    </div>
  );
};

export default EvaluationReportView;