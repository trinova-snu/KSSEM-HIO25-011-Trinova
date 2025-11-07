export interface InventoryItem {
  id: string;
  name: string;
  expiryDate: string;
  quantity: string;
  category: string;
}

export interface Recipe {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
}

export interface DonationRequest {
  id: string;
  restaurantName: string;
  location: string;
  items: InventoryItem[];
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  donationDate?: string;
  ngoName?: string;
  deliveryType?: 'pickup' | 'dropoff';
  pickupDateTime?: string;
  notes?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  reason: string;
  notes?: string;
  checked: boolean;
  isAiGenerated: boolean;
}

export interface SmartPlateData {
    name: string;
    description: string;
    calories: number;
    ingredients: string[];
    instructions: string[];
    nutrition: {
        carbohydrates: number;
        proteins: number;
        fats: number;
        vitaminsAndMinerals: number;
    };
}

export interface UserProfile {
  name: string;
  email: string;
  country: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  height: number;
  heightUnit: 'cm' | 'in';
  preferences: string[];
}

export interface HotelProfile {
  name: string;
  location: string;
  email: string;
  cuisineType?: string;
  contactNumber?: string;
  latitude?: number;
  longitude?: number;
}

export interface FoodBankProfile {
  name: string;
  location: string;
  email: string;
  contactPerson?: string;
  phoneNumber?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  darpanId?: string;
}


export interface NGO {
  id: string;
  name: string;
  location: string;
}

export interface FoodBankTransaction {
  id: string;
  ngoId: string;
  date: string;
  items: Pick<InventoryItem, 'name' | 'quantity' | 'category'>[];
  review: {
    rating: number;
    comment: string;
  };
}

export type MembershipTier = 'Silver' | 'Gold' | 'Diamond';

export interface RequirementRequest {
  id: string;
  foodBankName: string;
  foodBankLocation: string;
  requestedItems: string[];
  message: string;
  timestamp: string;
}

export interface WasteHotspot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  wasteScore: number;
  contactEmail: string;
  contactPhone: string;
}

export interface LearningCard {
    title: string;
    content: string;
    icon: string; // Icon name from icons.tsx
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface LearningModuleContent {
    title: string;
    cards: LearningCard[];
    quiz: QuizQuestion[];
}