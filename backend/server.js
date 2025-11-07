
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Allow the server to parse JSON request bodies

// Initialize the Gemini AI Client
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is not defined in the environment variables.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('Pantrix Backend is running!');
});

// A proxy endpoint for getting recipe suggestions
app.post('/api/recipes', async (req, res) => {
  try {
    const { foodItem, userProfile, language } = req.body;

    if (!foodItem) {
      return res.status(400).json({ error: 'foodItem is required' });
    }

    // This logic is moved from the frontend's geminiService.ts
    const languageMap = { 'en': 'English', 'es': 'Spanish', 'hi': 'Hindi', 'fr': 'French', 'de': 'German', 'ta': 'Tamil' };
    const languageName = languageMap[language] || 'English';
    const languageInstruction = `\n\nIMPORTANT: The user's preferred language is ${languageName}. You MUST provide the entire response (all keys and values) in ${languageName}.`;
    
    let personalizationInstructions = '';
    if (userProfile) {
        const preferences = userProfile.preferences.length > 0 ? `Their taste preferences are: ${userProfile.preferences.join(', ')}.` : '';
        personalizationInstructions = `\n\nIMPORTANT: Please personalize these recipes for the user. They are from ${userProfile.country}. Deeply incorporate the local cuisine and culinary traditions from their region into the recipe ideas. ${preferences} The recipes should also be suitable for their health profile.`;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert chef specializing in reducing food waste. Generate 3 simple and creative recipe ideas for using up the following ingredient: "${foodItem}". For each recipe, provide a name, a brief description, a list of ingredients, and step-by-step instructions.${personalizationInstructions}${languageInstruction}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recipes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["name", "description", "ingredients", "instructions"]
                        }
                    }
                },
                required: ["recipes"]
            },
        },
    });

    const jsonText = response.text.trim();
    res.json(JSON.parse(jsonText));

  } catch (error) {
    console.error('Error in /api/recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes from AI model.' });
  }
});

// You would continue to add more proxy endpoints here for other Gemini functions...
// e.g., app.post('/api/smart-plate', ...)
// e.g., app.post('/api/scan-bill', ...)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
