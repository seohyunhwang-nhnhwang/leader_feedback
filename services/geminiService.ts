
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
      3. **피드백 대응 스타일**:
         - 팀장님이 나의 '인격'이나 '태도'를 비난하면 즉시 방어적으로 대응하고 불쾌함을 표현하라.
         - 팀장님이 '구체적 행동(Fact)'과 '영향(Impact)'을 중심으로 말하면 수긍하고 경청하는 모습을 보여라.
         - 팀장님이 일방적으로 훈계하지 않고 나의 의견을 묻는 '열린 질문'을 던지면 진솔하고 구체적으로 답하라.
      4. **첫 인사 규칙**: 팀장님께 가벼운 인사를 건네고 면담 준비가 되었음을 알리는 정도로만 짧게 시작하라.
      5. 대화 프로세스(OCDAC)를 염두에 두고 리더의 유도를 따라간다.
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
    try {
      const result = await this.chat.sendMessage({ message });
      return result.text || "";
    } catch (error) {
      console.error("Gemini Message Error:", error);
      throw error;
    }
  }

  async generateReport(history: ChatMessage[]): Promise<EvaluationReport> {
    const prompt = `
      성과 면담 대화 내용을 FIRN 모델과 피드백 원칙에 따라 정밀 분석하여 JSON 리포트를 작성해줘.

      # Evaluation Framework: FIRN (각 20점)
      1. Fact (사실): 구체적인 관찰 행동 언급 여부
      2. Impact (영향): 조직/동료에게 미친 영향 설명 여부
      3. Request (요청): 명확한 행동 변화 요구 여부
      4. New Impact (새로운 영향): 변화 후의 긍정적 미래 제시 여부
      5. Manner (매너): I-Message 사용 및 양방향 소통 여부

      대화 내용:
      ${history.map(m => `${m.role === 'user' ? '팀장' : '팀원'}: ${m.text}`).join('\n')}

      반드시 아래 JSON 구조로 응답하라:
      {
        "summary": "면담의 핵심 맥락 요약",
        "firn_score": { "F": 0~20, "I": 0~20, "R": 0~20, "N": 0~20, "Manner": 0~20 },
        "good_points": ["구체적인 긍정적 발화 예시와 이유"],
        "improvement_points": ["아쉬운 발화의 수정 제안"],
        "overall_comment": "리더의 성장을 위한 진심 어린 조언"
      }
    `;

    try {
      // Gemini 3 Pro의 Thinking 기능을 활용하여 더 깊이 있는 분석 수행
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
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
    } catch (error) {
      console.error("Report Generation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
