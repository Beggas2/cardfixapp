import { secret } from "encore.dev/config";
import { APIError } from "encore.dev/api";

const geminiApiKey = secret("GeminiAPIKey");

export async function callGeminiAPI(payload: any, errorMessage: string): Promise<any> {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey()}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorDetail = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody.error && errorBody.error.message) {
          errorDetail = errorBody.error.message;
        }
      } catch (e) {
        // Error body was not JSON
      }
      throw new Error(errorDetail);
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts) {
      throw new Error("Unexpected API response format");
    }

    let jsonText = result.candidates[0].content.parts[0].text;
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(cleanedJsonText);
  } catch (error) {
    console.error(errorMessage, error);
    throw APIError.internal(`${errorMessage}: ${error.message}`);
  }
}
