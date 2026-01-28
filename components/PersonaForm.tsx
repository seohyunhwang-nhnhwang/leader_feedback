import React, { useState } from 'react';
import { Persona } from '../types.ts';

interface Props {
  onSubmit: (persona: Persona) => void;
}

const PersonaForm: React.FC<Props> = ({ onSubmit }) => {
  // 처음 앱을 켰을 때 모든 필드를 빈 문자열로 시작
  const [form, setForm] = useState<Persona>({
    job: '',
    title: '',
    selfEvaluation: '',
    disposition: '',
    currentIssue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">피평가자 정보 설정</h2>
        <p className="text-slate-500 mt-1">면담을 진행할 팀원의 페르소나를 설정해주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">담당 업무</label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={form.job}
            onChange={e => setForm({ ...form, job: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">호칭 (직위)</label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">본인 평가 요약</label>
          <textarea
            className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-20 resize-none placeholder-slate-500"
            placeholder="예: 피평가자가 작성한 본인 평가를 AI Tool로 요약하여 넣어주세요."
            value={form.selfEvaluation}
            onChange={e => setForm({ ...form, selfEvaluation: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">피평가자 성향 (말투, 태도, 욕구 등)</label>
          <textarea
            className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-20 resize-none placeholder-slate-500"
            placeholder="예: 냉철하고 논리적임, 인정 욕구가 강함, 수동적인 태도 등"
            value={form.disposition}
            onChange={e => setForm({ ...form, disposition: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">피드백이 필요한 부분 (현재 이슈)</label>
          <textarea
            className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-20 resize-none placeholder-slate-500"
            placeholder="예: 주간 보고 누락이 잦으며 협업 과정에서 마찰이 발생함"
            value={form.currentIssue}
            onChange={e => setForm({ ...form, currentIssue: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors mt-2 shadow-lg shadow-indigo-200 disabled:bg-slate-300"
          disabled={!form.job || !form.title || !form.selfEvaluation || !form.disposition || !form.currentIssue}
        >
          시뮬레이션 시작하기
        </button>
      </form>
    </div>
  );
};

export default PersonaForm;