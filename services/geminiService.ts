
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Morphs a face based on an input image, a prompt, and a seed.
   */
  async morphFace(
    base64Image: string,
    prompt: string,
    seed: number
  ): Promise<string> {
    try {
      // Clean up base64 string if it contains prefix
      const base64Data = base64Image.split(',')[1] || base64Image;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: `Please morph or alter this face according to the following description: ${prompt}. Keep the basic identity and composition but apply the specific transformations requested.`,
            },
          ],
        },
        config: {
          seed: seed,
        },
      });

      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error("No response generated from the AI model.");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      throw new Error("The model did not return an image. It might have only returned text: " + (response.text || "No text returned either."));
    } catch (error: any) {
      console.error("Gemini Morph Error:", error);
      throw new Error(error.message || "An error occurred during the morphing process.");
    }
  }
}

export const geminiService = new GeminiService();
