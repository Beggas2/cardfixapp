import { api } from "encore.dev/api";
import { GenerateFlashcardsRequest, GenerateFlashcardsResponse } from "./types";
import { callGeminiAPI } from "./gemini";

// Generates flashcards for a specific subtopic.
export const generateFlashcards = api<GenerateFlashcardsRequest, GenerateFlashcardsResponse>(
  { expose: true, method: "POST", path: "/ai/generate-flashcards" },
  async (req) => {
    const prompt = `Crie ${req.quantity} flashcards de alta qualidade sobre "${req.subtopicName}" (tópico: "${req.topicName}", matéria: "${req.subjectName}"). Para cada card, forneça "pergunta", "resposta" e um "importanceRank" numérico de 0.0 a 1.0, onde 1.0 é extremamente importante para um especialista na área. Retorne um array de objetos JSON.`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { 
          type: "ARRAY", 
          items: { 
            type: "OBJECT", 
            properties: { 
              pergunta: { type: "STRING" }, 
              resposta: { type: "STRING" }, 
              importanceRank: { type: "NUMBER" } 
            } 
          } 
        }
      }
    };

    const flashcards = await callGeminiAPI(payload, "Failed to generate flashcards");
    
    return {
      flashcards: flashcards.map((card: any) => ({
        question: card.pergunta,
        answer: card.resposta,
        importanceRank: card.importanceRank,
      })),
    };
  }
);
