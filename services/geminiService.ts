import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe, InventoryItem, SmartPlateData, UserProfile, WasteHotspot, LearningModuleContent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = (jsonText: string) => {
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText, e);
        throw new Error("Received malformed JSON from AI model.");
    }
};

const getLanguageInstruction = (language: string): string => {
    const languageMap: { [key: string]: string } = { 'en': 'English', 'es': 'Spanish', 'hi': 'Hindi', 'fr': 'French', 'de': 'German', 'ta': 'Tamil' };
    const languageName = languageMap[language as keyof typeof languageMap] || 'English';
    return `\n\nIMPORTANT: The user's preferred language is ${languageName}. You MUST provide the entire response (all keys and values) in ${languageName}.`;
};

export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface NgoWithCoords {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

export const geocodeLocation = async (address: string): Promise<GeoLocation> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide the approximate latitude and longitude for the following location: "${address}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        latitude: { type: Type.NUMBER, description: "The latitude of the location." },
                        longitude: { type: Type.NUMBER, description: "The longitude of the location." }
                    },
                    required: ["latitude", "longitude"]
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);
        if (parsedJson && typeof parsedJson.latitude === 'number' && typeof parsedJson.longitude === 'number') {
            return parsedJson;
        }
        throw new Error("Unexpected structure for geocoding data.");
    } catch (error) {
        console.error("Error geocoding location:", error);
        if (address.includes("New York")) return { latitude: 40.7128, longitude: -74.0060 };
        if (address.includes("Los Angeles")) return { latitude: 34.0522, longitude: -118.2437 };
        if (address.includes("Miami")) return { latitude: 25.7617, longitude: -80.1918 };
        if (address.includes("Denver")) return { latitude: 39.7392, longitude: -104.9903 };
        throw new Error("Could not geocode location from AI model.");
    }
};

export const getBusinessNames = async (location: string, businessType: 'restaurant' | 'food bank'): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a list of 5 realistic, existing-sounding names for a ${businessType} located in "${location}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        names: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of business names."
                        }
                    },
                    required: ["names"]
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);
        if (parsedJson && parsedJson.names && Array.isArray(parsedJson.names)) {
            return parsedJson.names;
        }
        throw new Error("Unexpected structure for business names.");
    } catch (error) {
        console.error(`Error fetching ${businessType} names:`, error);
        if (businessType === 'restaurant') return ['The Grand Eatery', 'Sunset Bistro', 'Ocean\'s Catch', 'Mountain View Grill', 'City Center Cafe'];
        return ['City Harvest Food Bank', 'Community FoodShare', 'Regional Food Pantry', 'Hope Distribution Center', 'The Giving Spoon'];
    }
};


export const getRecipeSuggestions = async (foodItem: string, userProfile: UserProfile | null, language: string): Promise<Recipe[]> => {
    try {
        let personalizationInstructions = '';
        if (userProfile) {
            const preferences = userProfile.preferences.length > 0 ? `Their taste preferences are: ${userProfile.preferences.join(', ')}.` : '';
            personalizationInstructions = `\n\nIMPORTANT: Please personalize these recipes for the user. They are from ${userProfile.country}. Deeply incorporate the local cuisine and culinary traditions from their region into the recipe ideas. For example, if they are from Tamil Nadu, India, suggest fusion recipes involving local dishes like idli or dosa. ${preferences} The recipes should also be suitable for their health profile.`;
        }
        
        const languageInstruction = getLanguageInstruction(language);

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
                                    name: {
                                        type: Type.STRING,
                                        description: "The name of the recipe."
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: "A brief, enticing description of the recipe."
                                    },
                                    ingredients: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: "A list of ingredients required for the recipe."
                                    },
                                    instructions: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: "The step-by-step instructions for preparing the recipe."
                                    }
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
        const parsedJson = parseJsonResponse(jsonText);
        
        if (parsedJson && parsedJson.recipes) {
            return parsedJson.recipes;
        } else {
            console.error("Unexpected JSON structure:", parsedJson);
            return [];
        }
    } catch (error) {
        console.error("Error fetching recipe suggestions:", error);
        throw new Error("Could not fetch recipes from AI model.");
    }
};

export const getSmartRecipes = async (foodItems: string[], userProfile: UserProfile | null, language: string): Promise<Recipe[]> => {
    try {
        let personalizationInstructions = '';
        if (userProfile) {
            const preferences = userProfile.preferences.length > 0 ? `The user's taste preferences include: ${userProfile.preferences.join(', ')}.` : '';
            personalizationInstructions = ` Please tailor these recipes to the user, who is from ${userProfile.country}. Deeply incorporate the local cuisine and culinary traditions from their region into the recipe ideas. For example, if they are from Tamil Nadu, India, suggest fusion recipes involving local dishes like idli or dosa. ${preferences}`;
        }

        const languageInstruction = getLanguageInstruction(language);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a creative restaurant chef skilled at minimizing waste. Create 3 creative and cohesive recipe ideas that use all of the following ingredients that are about to expire: ${foodItems.join(', ')}.${personalizationInstructions}${languageInstruction} For each recipe, provide a unique name, a short description, a list of ingredients, and step-by-step instructions.`,
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
                                    name: { type: Type.STRING, description: "The name of the recipe." },
                                    description: { type: Type.STRING, description: "A brief description of the recipe." },
                                    ingredients: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: "A list of ingredients for the recipe."
                                    },
                                    instructions: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: "The step-by-step instructions to make the recipe."
                                    }
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
        const parsedJson = parseJsonResponse(jsonText);

        if (parsedJson && parsedJson.recipes) {
            return parsedJson.recipes;
        } else {
            throw new Error("Unexpected structure for smart recipes.");
        }
    } catch (error) {
        console.error("Error fetching smart recipes:", error);
        throw new Error("Could not fetch smart recipes from AI model.");
    }
};

export const getShoppingListSuggestions = async (inventory: InventoryItem[]): Promise<{ name: string; quantity: string; reason: string; }[]> => {
    try {
        const inventoryString = inventory.map(item => `${item.name} (${item.quantity})`).join(', ');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an intelligent pantry assistant. Your goal is to help a user create a smart shopping list that minimizes food waste and complements their existing inventory.
            
            Current inventory: ${inventoryString || 'empty'}.

            Based on this inventory, generate a predictive shopping list of 5-7 items. Infer potential consumption patterns (e.g., if they have pasta, they might need sauce). For each item, provide a name, a suggested quantity, and a brief, helpful reason for adding it. Reasons could be 'running low', 'pairs well with an expiring item', or 'a healthy staple to have'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        shopping_list: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The name of the shopping item." },
                                    quantity: { type: Type.STRING, description: "The suggested quantity to buy." },
                                    reason: { type: Type.STRING, description: "A brief reason for the suggestion." }
                                },
                                required: ["name", "quantity", "reason"]
                            }
                        }
                    },
                    required: ["shopping_list"]
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);

        if (parsedJson && parsedJson.shopping_list) {
            return parsedJson.shopping_list;
        } else {
             throw new Error("Unexpected structure for shopping list.");
        }
    } catch (error) {
        console.error("Error fetching shopping list:", error);
        throw new Error("Could not fetch shopping list from AI model.");
    }
};


export const getNearbyFoodBanks = async (location: string): Promise<NgoWithCoords[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Find 5 real, major food banks or food rescue organizations near "${location}". For each, provide their name, full address, and approximate latitude and longitude.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        food_banks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The name of the food bank." },
                                    address: { type: Type.STRING, description: "The full address of the food bank." },
                                    latitude: { type: Type.NUMBER, description: "The latitude." },
                                    longitude: { type: Type.NUMBER, description: "The longitude." }
                                },
                                required: ["name", "address", "latitude", "longitude"]
                            }
                        }
                    },
                    required: ["food_banks"]
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);
        
        if (parsedJson && parsedJson.food_banks) {
            return parsedJson.food_banks;
        } else {
             throw new Error("Unexpected structure for food banks with coordinates.");
        }
    } catch (error) {
        console.error("Error fetching nearby food banks with coords:", error);
        return [
            { name: 'City Harvest', address: '123 Main St, New York, NY', latitude: 40.715, longitude: -74.002 },
            { name: 'Food Bank for NYC', address: '456 Second Ave, New York, NY', latitude: 40.729, longitude: -73.985 },
            { name: 'St. John\'s Bread & Life', address: '789 Broadway, Brooklyn, NY', latitude: 40.693, longitude: -73.931 },
            { name: 'Metropolitan Council on Jewish Poverty', address: '1010 Tenth Ave, New York, NY', latitude: 40.765, longitude: -73.990 },
            { name: 'The Bowery Mission', address: '227 Bowery, New York, NY', latitude: 40.722, longitude: -73.993 }
        ];
    }
};

export const getWasteHotspots = async (location: string): Promise<Omit<WasteHotspot, 'id'>[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `You are a food waste analyst. Generate a list of 7 fictional but realistic-sounding restaurant 'food waste hotspots' in "${location}". These are potential partners for food donations. Ensure the locations are geographically scattered across different parts of the city (e.g., downtown, suburbs, different districts) to provide a good distribution on a map. For each, provide their name, a plausible full address, approximate latitude and longitude, a "wasteScore" from 1 (low) to 10 (high) representing potential for food surplus, a fictional contact email, and a fictional contact phone number.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        hotspots: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    address: { type: Type.STRING },
                                    latitude: { type: Type.NUMBER },
                                    longitude: { type: Type.NUMBER },
                                    wasteScore: { type: Type.NUMBER },
                                    contactEmail: { type: Type.STRING },
                                    contactPhone: { type: Type.STRING },
                                },
                                required: ["name", "address", "latitude", "longitude", "wasteScore", "contactEmail", "contactPhone"]
                            }
                        }
                    },
                    required: ["hotspots"]
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);
        if (parsedJson && parsedJson.hotspots) {
            return parsedJson.hotspots;
        } else {
            throw new Error("Unexpected structure for waste hotspots.");
        }
    } catch (error) {
        console.error("Error fetching waste hotspots:", error);
        // Fallback data
        return [
            { name: 'The Lavish Buffet', address: '101 City Center, New York, NY', latitude: 40.7580, longitude: -73.9855, wasteScore: 9, contactEmail: 'mgr@lavishbuffet.demo', contactPhone: '555-0101' },
            { name: 'Gourmet Catering Co.', address: '202 Commerce St, New York, NY', latitude: 40.7128, longitude: -74.0060, wasteScore: 8, contactEmail: 'contact@gourmetcatering.demo', contactPhone: '555-0102' },
            { name: 'The Daily Bread Bakery', address: '303 Artisan Way, Brooklyn, NY', latitude: 40.6782, longitude: -73.9442, wasteScore: 6, contactEmail: 'info@dailybread.demo', contactPhone: '555-0103' },
            { name: 'Mega Grocery Mart', address: '404 Supermarket Ave, Queens, NY', latitude: 40.7282, longitude: -73.7949, wasteScore: 10, contactEmail: 'donations@megamart.demo', contactPhone: '555-0104' },
            { name: 'Harborview Hotel', address: '505 Waterfront Pl, New York, NY', latitude: 40.7050, longitude: -74.0090, wasteScore: 9, contactEmail: 'events@harborview.demo', contactPhone: '555-0105' },
        ];
    }
};

export const extractItemsFromBill = async (base64Image: string): Promise<Omit<InventoryItem, 'id'>[]> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        const textPart = {
            text: `You are a receipt scanning expert for a pantry management app. Analyze this receipt image and extract all food items. For each item, provide:
1.  'name': The name of the item.
2.  'quantity': The quantity purchased (e.g., '1 lb', '2 cartons'). If not specified, default to '1 unit'.
3.  'category': A relevant category from this list: "Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Drinks", "Other".
4.  'expiryDate': An *estimated* expiry date in 'YYYY-MM-DD' format. Base your estimation on the type of food and a purchase date of ${todayString}. For example:
    - Milk/Yogurt: 7-10 days
    - Fresh meat/poultry: 3-5 days
    - Bread: 5-7 days
    - Fresh produce (berries, lettuce): 4-7 days
    - Fresh produce (apples, potatoes): 2-4 weeks
    - Canned goods/pasta: 1-2 years
    
Do not include non-food items like 'Tote Bag' or 'Tax'. If you cannot identify any food items, return an empty array.`
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: {
                parts: [
                    imagePart,
                    textPart
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    quantity: { type: Type.STRING },
                                    category: { type: Type.STRING },
                                    expiryDate: { type: Type.STRING, description: "Estimated date in YYYY-MM-DD format." }
                                },
                                required: ["name", "quantity", "category", "expiryDate"]
                            }
                        }
                    },
                    required: ["items"]
                },
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);

        if (parsedJson && parsedJson.items) {
            // Validate date format, just in case
            return parsedJson.items.filter((item: any) => /^\d{4}-\d{2}-\d{2}$/.test(item.expiryDate));
        } else {
            throw new Error("Unexpected structure for bill items.");
        }
    } catch (error) {
        console.error("Error extracting items from bill:", error);
        throw new Error("Could not extract items from bill using AI model.");
    }
};

export const generateSmartPlate = async (foodItems: string[], userProfile: UserProfile | null, language: string): Promise<SmartPlateData> => {
    try {
        let personalizationInstructions = '';
        if (userProfile) {
            const preferences = userProfile.preferences.length > 0 ? `The user's taste preferences include: ${userProfile.preferences.join(', ')}.` : 'The user has no specific taste preferences.';
            personalizationInstructions = `The user is from ${userProfile.country}, weighs ${userProfile.weight} ${userProfile.weightUnit}, and is ${userProfile.height} ${userProfile.heightUnit} tall. ${preferences} When creating the meal, deeply incorporate the local cuisine and culinary traditions from their region. For example, if they are from Tamil Nadu, India, the meal could be a healthy version or fusion of a local dish. Please take this into account when determining the recipe, nutritional balance, and calorie count.`;
        }
        
        const languageInstruction = getLanguageInstruction(language);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a nutritionist and chef who specializes in creating balanced meals that minimize food waste.
            
            Create a "Smart Plate" analysis for a single, cohesive, and balanced meal recipe that uses ALL of the following ingredients: ${foodItems.join(', ')}.
            
            ${personalizationInstructions}
            ${languageInstruction}

            Provide the following details in your response:
            1. 'name': A creative name for the meal.
            2. 'description': A brief explanation of why this meal is nutritionally balanced.
            3. 'calories': An estimated total calorie count for the entire meal (as a number).
            4. 'ingredients': A list of all ingredients needed, including the ones provided.
            5. 'instructions': Step-by-step instructions to prepare the meal.
            6. 'nutrition': An estimated nutritional breakdown. Provide percentages for 'carbohydrates', 'proteins', 'fats', and a combined 'vitaminsAndMinerals' category. These four percentages MUST add up to 100.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        smart_plate: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the meal." },
                                description: { type: Type.STRING, description: "A brief description of the meal's nutritional balance." },
                                calories: { type: Type.NUMBER, description: "The estimated total calorie count." },
                                ingredients: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "A list of all ingredients."
                                },
                                instructions: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "The step-by-step instructions."
                                },
                                nutrition: {
                                    type: Type.OBJECT,
                                    properties: {
                                        carbohydrates: { type: Type.NUMBER, description: "Percentage of carbohydrates. e.g. 45" },
                                        proteins: { type: Type.NUMBER, description: "Percentage of proteins. e.g. 30" },
                                        fats: { type: Type.NUMBER, description: "Percentage of fats. e.g. 20" },
                                        vitaminsAndMinerals: { type: Type.NUMBER, description: "Percentage of vitamins and minerals. e.g. 5" },
                                    },
                                    required: ["carbohydrates", "proteins", "fats", "vitaminsAndMinerals"]
                                }
                            },
                            required: ["name", "description", "calories", "ingredients", "instructions", "nutrition"]
                        }
                    },
                    required: ["smart_plate"]
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);

        if (parsedJson && parsedJson.smart_plate) {
            return parsedJson.smart_plate;
        } else {
            throw new Error("Unexpected structure for smart plate data.");
        }
    } catch (error) {
        console.error("Error generating smart plate:", error);
        throw new Error("Could not generate a smart plate from AI model.");
    }
};

export const generateRecipeVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation finished, but no download link was provided.");
        }

        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to download video: ${response.statusText} - ${errorText}`);
        }
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        return videoUrl;

    } catch (error) {
        console.error("Error in generateRecipeVideo:", error);
        throw error;
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a pleasant, clear voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Could not generate speech from AI model.");
    }
};

export const getLearningContent = async (topicId: 'food-storage' | 'carbon-impact', language: string): Promise<LearningModuleContent> => {
    const languageInstruction = getLanguageInstruction(language);
    
    let topicInstructions = '';
    if (topicId === 'food-storage') {
        topicInstructions = `
        Topic: "Food Storage Tips to Reduce Waste".
        - The cards should provide practical, easy-to-understand tips for storing common household foods (e.g., bread, berries, leafy greens, dairy).
        - Use simple icons for each card from this list: 'FridgeIcon', 'AppleIcon', 'CubeIcon', 'CalendarIcon', 'TagIcon'.
        - The quiz should test the user's understanding of these storage tips.
        - Questions should be multiple choice. Provide a brief explanation for the correct answer.
        `;
    } else { // carbon-impact
        topicInstructions = `
        Topic: "Understanding the Carbon Impact of Food Waste".
        - The cards should explain the connection between food waste, landfills, methane gas, and climate change in simple terms.
        - Include a card about the positive impact of reducing waste.
        - Use simple icons for each card from this list: 'LeafIcon', 'TrashIcon', 'FactoryIcon', 'SparklesIcon', 'ChartBarIcon'.
        - The quiz should test the user's understanding of these concepts.
        - Questions should be multiple choice. Provide a brief explanation for the correct answer.
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert educator creating an interactive learning module for a food waste reduction app. Create content for the specified topic.
            
            ${topicInstructions}
            
            Your response must include a title, 5 learning cards, and a 5-question quiz.
            ${languageInstruction}
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        learningModule: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "The title of the learning module." },
                                cards: {
                                    type: Type.ARRAY,
                                    description: "An array of 5 learning flashcards.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            content: { type: Type.STRING, description: "A short, educational paragraph (2-3 sentences)." },
                                            icon: { type: Type.STRING, description: "The name of a relevant icon from the provided list." },
                                        },
                                        required: ["title", "content", "icon"]
                                    }
                                },
                                quiz: {
                                    type: Type.ARRAY,
                                    description: "An array of 5 multiple-choice quiz questions.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            question: { type: Type.STRING },
                                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 possible answers." },
                                            correctAnswer: { type: Type.STRING, description: "The exact string of the correct answer from the options array." },
                                            explanation: { type: Type.STRING, description: "A brief explanation for why the answer is correct." },
                                        },
                                        required: ["question", "options", "correctAnswer", "explanation"]
                                    }
                                }
                            },
                            required: ["title", "cards", "quiz"]
                        }
                    },
                    required: ["learningModule"]
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = parseJsonResponse(jsonText);

        if (parsedJson && parsedJson.learningModule) {
            return parsedJson.learningModule;
        } else {
            throw new Error("Unexpected structure for learning module content.");
        }
    } catch (error) {
        console.error("Error fetching learning content:", error);
        throw new Error("Could not fetch learning content from AI model.");
    }
};
