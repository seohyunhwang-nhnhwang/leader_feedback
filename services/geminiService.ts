
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Persona, ChatMessage, EvaluationReport } from "../types";

const API_KEY = process.env.API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private persona: Persona | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async startSimulation(persona: Persona) {
    this.persona = persona;
    const systemInstruction = `
      # Role
      너는 기업의 성과 면담 시뮬레이션에 참여하는 '팀원(피평가자)'이다.
      사용자가 "대화 종료" 또는 "평가해줘"라고 입력하기 전까지는 철저히 이 역할에 충실하라.

      # Persona Context
      - 담당 업무: ${persona.job}
      - 호칭: ${persona.title}
      - 본인 평가: ${persona.selfEvaluation}
      - 피평가자 성향 및 특성: ${persona.disposition}
      - 현재 이슈 (피드백이 필요한 부분): ${persona.currentIssue}

      # Behavior Guidelines
      1. 사용자를 반드시 '팀장님'이라고 호칭하며 예의를 갖춘다.
      2. **피평가자 성향 반영**: "${persona.disposition}"에 맞춰 말투와 태도를 유지하라.
      3. **피드백 대응 스타일 (중요)**:
         - 팀장님이 나의 '인격'이나 '태도'를 비난하면 즉시 방어적으로 대응하고 불쾌함을 표현하라.
         - 팀장님이 '구체적 행동(Fact)'과 '영향(Impact)'을 중심으로 말하면 수긍하고 경청하는 모습을 보여라.
         - 팀장님이 일방적으로 훈계하지 않고 나의 의견을 묻는 '열린 질문'을 던지면 진솔하고 구체적으로 답하라.
      4. **첫 인사 규칙**: 대화 시작 시 자신의 성과를 장황하게 나열하지 마라. 팀장님께 가벼운 인사를 건네고 면담 준비가 되었음을 알리는 정도로만 짧게 시작하라.
      5. 특정 기업명은 절대 언급하지 않으며 보편적인 비즈니스 용어를 사용한다.
      6. 대화 프로세스(OCDAC)를 염두에 두고 리더의 유도를 따라간다.

      사용자가 인사를 건네며 대화를 시작할 때까지 기다리거나, 가볍게 먼저 인사할 수 있다.
    `;

    this.chat = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return this.chat;
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chat) throw new Error("Chat not initialized");
    const result = await this.chat.sendMessage({ message });
    return result.text || "";
  }

  async generateReport(history: ChatMessage[]): Promise<EvaluationReport> {
    const prompt = `
      성과 면담 대화 내용을 FIRN 모델과 피드백 원칙에 따라 분석하여 JSON 리포트를 작성해줘.

      # Evaluation Framework: FIRN + Good Feedback Principles
      1. FIRN 모델 준수 (각 20점):
         - Fact (사실): 관찰된 구체적 행동을 객관적으로 전달했는가?
         - Impact (영향): 그 행동이 조직/동료에게 미친 실질적 영향을 설명했는가?
         - Request (요청): 구체적으로 변화를 원하는 행동을 제안했는가?
         - New Impact (새로운 영향): 변화 시 기대되는 긍정적 미래를 제시했는가?
      2. 피드백 매너 및 태도 (20점):
         - 사람이 아닌 '행동'에 집중했는가? (인신공격성 발언 유무)
         - 상대방의 감정을 배려하며 'I-Message'를 사용했는가?
         - 양방향 소통(질문)이 이루어졌는가?

      대화 내용:
      ${history.map(m => `${m.role === 'user' ? '팀장' : '팀원'}: ${m.text}`).join('\n')}

      반드시 아래 JSON 구조로 응답해:
      {
        "summary": "면담 요약",
        "firn_score": { "F": 0~20, "I": 0~20, "R": 0~20, "N": 0~20, "Manner": 0~20 },
        "good_points": ["잘한 점 리스트"],
        "improvement_points": ["개선점 및 수정 제안 리스트"],
        "overall_comment": "최종 조언"
      }
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            firn_score: {
              type: Type.OBJECT,
              properties: {
                F: { type: Type.NUMBER },
                I: { type: Type.NUMBER },
                R: { type: Type.NUMBER },
                N: { type: Type.NUMBER },
                Manner: { type: Type.NUMBER }
              },
              required: ["F", "I", "R", "N", "Manner"]
            },
            good_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvement_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            overall_comment: { type: Type.STRING }
          },
          required: ["summary", "firn_score", "good_points", "improvement_points", "overall_comment"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    const totalScore = data.firn_score.F + data.firn_score.I + data.firn_score.R + data.firn_score.N + data.firn_score.Manner;
    return { ...data, totalScore };
  }
}

export const geminiService = new GeminiService();
