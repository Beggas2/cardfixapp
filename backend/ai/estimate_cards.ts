import { api } from "encore.dev/api";
import { EstimateCardsRequest, EstimateCardsResponse } from "./types";
import { callGeminiAPI } from "./gemini";

// Estimates the number of flashcards needed for each subtopic.
export const estimateCards = api<EstimateCardsRequest, EstimateCardsResponse>(
  { expose: true, method: "POST", path: "/ai/estimate-cards" },
  async (req) => {
    const prompt = `Analise a estrutura do plano de estudos fornecida. Para cada "subtopico", adicione uma chave "estimatedCount" com um número inteiro que represente a quantidade ideal de flashcards para um estudo aprofundado (entre 5 e 20). Retorne o MESMO objeto JSON, apenas com a adição dessa chave em cada subtopico. JSON: ${JSON.stringify(req.subjects)}`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { 
          type: "OBJECT", 
          properties: { 
            materias: { 
              type: "ARRAY", 
              items: { 
                type: "OBJECT", 
                properties: { 
                  id: { type: "STRING" }, 
                  nome: { type: "STRING" }, 
                  topicos: { 
                    type: "ARRAY", 
                    items: { 
                      type: "OBJECT", 
                      properties: { 
                        nome: { type: "STRING" }, 
                        subtopicos: { 
                          type: "ARRAY", 
                          items: { 
                            type: "OBJECT", 
                            properties: { 
                              nome: { type: "STRING" }, 
                              estimatedCount: { type: "INTEGER" } 
                            } 
                          } 
                        } 
                      } 
                    } 
                  } 
                } 
              } 
            } 
          } 
        }
      }
    };

    const result = await callGeminiAPI(payload, "Failed to estimate flashcard counts");
    return { subjects: result.materias };
  }
);
