import { api } from "encore.dev/api";
import { GeneratePlanRequest, GeneratePlanResponse } from "./types";
import { callGeminiAPI } from "./gemini";
import { generateId } from "../users/utils";

// Generates a study plan structure using AI.
export const generatePlan = api<GeneratePlanRequest, GeneratePlanResponse>(
  { expose: true, method: "POST", path: "/ai/generate-plan" },
  async (req) => {
    const prompt = `Você é um especialista em criar planos de estudo para concursos. Analise o edital para o cargo de "${req.role}". Crie a estrutura hierárquica (matérias > tópicos > subtopicos). O campo "nome" de cada "subtopico" deve ser curto e conter apenas UM item/lei/conceito. Retorne um objeto JSON contendo apenas a chave "materias". Edital: ${req.editalText.substring(0, 20000)}`;
    
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
                              nome: { type: "STRING" } 
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

    const result = await callGeminiAPI(payload, "Failed to generate study plan structure");
    
    // Add IDs and order to the structure
    const subjects = result.materias.map((materia: any, subjectIndex: number) => ({
      id: generateId(),
      name: materia.nome,
      order: subjectIndex,
      topics: materia.topicos.map((topico: any, topicIndex: number) => ({
        id: generateId(),
        name: topico.nome,
        order: topicIndex,
        subtopics: topico.subtopicos.map((subtopico: any, subtopicIndex: number) => ({
          id: generateId(),
          name: subtopico.nome,
          order: subtopicIndex,
        })),
      })),
    }));

    return { subjects };
  }
);
