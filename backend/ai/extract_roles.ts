import { api } from "encore.dev/api";
import { ExtractRolesRequest, ExtractRolesResponse } from "./types";
import { callGeminiAPI } from "./gemini";

// Extracts job roles from an edital text using AI.
export const extractRoles = api<ExtractRolesRequest, ExtractRolesResponse>(
  { expose: true, method: "POST", path: "/ai/extract-roles" },
  async (req) => {
    const prompt = `Analise o texto de um edital de concurso público do Brasil. Identifique e liste todos os cargos distintos. Retorne um array JSON de strings. Exemplo: ["Médico - Cardiologia", "Engenheiro Civil"]. Se nenhum cargo for listado, retorne ["Cargo Único / Geral"]. Texto: ${req.editalText.substring(0, 15000)}`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        responseMimeType: "application/json", 
        responseSchema: { 
          type: "ARRAY", 
          items: { type: "STRING" } 
        } 
      }
    };

    const roles = await callGeminiAPI(payload, "Failed to extract roles from edital");
    return { roles };
  }
);
