import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { InventoryItem as InventoryItemType, DonationRequest, Recipe, ShoppingListItem as ShoppingListItemType, SmartPlateData, UserProfile, HotelProfile, FoodBankProfile, MembershipTier, RequirementRequest, WasteHotspot, Notification, CookedFoodItem, CookedFoodOrder } from './types';
import { getRecipeSuggestions, getSmartRecipes, getShoppingListSuggestions, generateSmartPlate, geocodeLocation, getBusinessNames, getWasteHotspots } from './services/geminiService';
import Header from './components/Header';
import InventoryList from './components/InventoryList';
import Modal from './components/Modal';
import AddItemForm from './components/AddItemForm';
import RecipeModal from './components/RecipeModal';
import Welcome from './components/Welcome';
import PublicSignUp from './components/PublicLogin';
import PublicLoginPage from './components/PublicLoginPage';
import HotelLogin from './components/HotelLogin';
import HotelSignUp from './components/HotelSignUp';
import HotelPantry from './components/HotelPantry';
import Dashboard from './components/Dashboard';
import PublicNav from './components/PublicNav';
import HotelNav from './components/HotelNav';
import FoodBankLogin from './components/FoodBankLogin';
import FoodBankSignUp from './components/FoodBankSignUp';
import FoodBankDashboard from './components/FoodBankDashboard';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import HealthBot from './components/HealthBot';
import ShoppingList from './components/ShoppingList';
import { AlertTriangleIcon, BotIcon, ChefHatIcon, FireIcon } from './components/icons';
import ScanBillModal from './components/ScanBillModal';
import SmartPlateModal from './components/SmartPlateModal';
import VideoGeneratorModal from './components/VideoGeneratorModal';
import CreateDonationModal from './components/CreateDonationModal';
import EditProfilePage from './components/EditProfilePage';
import KnowledgeCenter from './components/KnowledgeCenter';
import NotificationsModal from './components/NotificationsModal';
import AnnounceCookedFoodModal from './components/AnnounceCookedFoodModal';
import ClaimCookedFoodModal from './components/ClaimCookedFoodModal';
import CookedFoodOrdersPage from './components/CookedFoodOrdersPage';
import TrackOrderModal from './components/TrackOrderModal';
import LiveCookedFoodOrders from './components/LiveCookedFoodOrders';
import AssignDeliveryModal from './components/AssignDeliveryModal';

type Page = 'welcome' | 'public-signup' | 'public-login' | 'hotel-login' | 'hotel-signup' | 'food-bank-login' | 'food-bank-signup' | 'pantry' | 'hotel-pantry' | 'food-bank-dashboard' | 'edit-profile';
type UserType = 'public' | 'hotel' | 'food-bank' | null;
type PublicView = 'dashboard' | 'inventory' | 'healthbot' | 'shopping-list' | 'knowledge' | 'my_orders';
type HotelView = 'dashboard' | 'inventory' | 'flash_donations';

const initialDonationRequests: DonationRequest[] = [
    { id: 'don-16222', restaurantName: 'The Grand Eatery', location: 'New York, USA', items: [{ id: 'd1-1', name: 'Potatoes', expiryDate: '2024-07-20', quantity: '20 lbs', category: 'Produce' }, { id: 'd1-2', name: 'Onions', expiryDate: '2024-07-25', quantity: '10 lbs', category: 'Produce' }], status: 'pending' },
    { id: 'don-16333', restaurantName: 'Sunset Bistro', location: 'Los Angeles, USA', items: [{ id: 'd2-1', name: 'Chicken Breast', expiryDate: '2024-07-18', quantity: '30 lbs', category: 'Meat' }], status: 'pending' },
    { id: 'don-16444', restaurantName: 'The Grand Eatery', location: 'New York, USA', items: [{ id: 'd3-1', name: 'Milk', expiryDate: '2024-05-15', quantity: '10 Gallons', category: 'Dairy' }], status: 'completed', donationDate: '2024-05-10' },
    { id: 'don-16555', restaurantName: 'Ocean\'s Catch', location: 'Miami, USA', items: [{ id: 'd4-1', name: 'Fish Fillets', expiryDate: '2024-07-19', quantity: '15 lbs', category: 'Meat' }], status: 'accepted' },
    { id: 'don-16666', restaurantName: 'The Grand Eatery', location: 'New York, USA', items: [{ id: 'd5-1', name: 'Bread', expiryDate: '2024-04-25', quantity: '15 Loaves', category: 'Bakery' }, { id: 'd5-2', name: 'Cheese', expiryDate: '2024-05-10', quantity: '5 lbs', category: 'Dairy' }], status: 'completed', donationDate: '2024-04-22' },
    { id: 'don-16777', restaurantName: 'Sunset Bistro', location: 'Los Angeles, USA', items: [{ id: 'd6-1', name: 'Tomatoes', expiryDate: '2024-05-05', quantity: '25 lbs', category: 'Produce' }], status: 'completed', donationDate: '2024-05-01' },
    { id: 'don-16888', restaurantName: 'Mountain View Grill', location: 'Denver, USA', items: [{ id: 'd7-1', name: 'Steak', expiryDate: '2024-07-17', quantity: '40 lbs', category: 'Meat' }], status: 'pending' }
];

const getMembershipTier = (donationCount: number): MembershipTier | null => {
    if (donationCount >= 25) return 'Diamond';
    if (donationCount >= 10) return 'Gold';
    if (donationCount >= 1) return 'Silver';
    return null;
};

// A custom hook to persist state to localStorage
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            if (storedValue) {
                return JSON.parse(storedValue);
            }
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
        }
        return initialValue;
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
}


const AppContent: React.FC = () => {
    const { t, language } = useLanguage();
    // Routing and user state
    const [currentPage, setCurrentPage] = usePersistentState<Page>('pantrix-currentPage', 'welcome');
    const [previousPage, setPreviousPage] = useState<Page>('welcome');
    const [userType, setUserType] = usePersistentState<UserType>('pantrix-userType', null);
    const [userProfile, setUserProfile] = usePersistentState<UserProfile | null>('pantrix-userProfile', null);
    const [hotelProfile, setHotelProfile] = usePersistentState<HotelProfile | null>('pantrix-hotelProfile', null);
    const [foodBankProfile, setFoodBankProfile] = usePersistentState<FoodBankProfile | null>('pantrix-foodBankProfile', null);

    // View state
    const [publicView, setPublicView] = usePersistentState<PublicView>('pantrix-publicView', 'dashboard');
    const [hotelView, setHotelView] = usePersistentState<HotelView>('pantrix-hotelView', 'dashboard');

    // Shared state
    const [inventory, setInventory] = usePersistentState<InventoryItemType[]>('pantrix-inventory', []);
    const [donationRequests, setDonationRequests] = usePersistentState<DonationRequest[]>('pantrix-donationRequests', initialDonationRequests);
    
    // UI Modals state
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isScanBillModalOpen, setScanBillModalOpen] = useState(false);
    const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isCreateDonationModalOpen, setCreateDonationModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoRecipe, setVideoRecipe] = useState<Recipe | null>(null);

    // Hotel user state
    const [smartRecipes, setSmartRecipes] = useState<Recipe[]>([]);
    const [isLoadingSmartRecipes, setIsLoadingSmartRecipes] = useState(false);
    const [donationCount, setDonationCount] = usePersistentState<number>('pantrix-donationCount', 0);

    // Shopping List state
    const [shoppingList, setShoppingList] = usePersistentState<ShoppingListItemType[]>('pantrix-shoppingList', []);
    const [isLoadingShoppingList, setIsLoadingShoppingList] = useState(false);

    // Smart Plate state
    const [smartPlate, setSmartPlate] = useState<SmartPlateData | null>(null);
    const [isSmartPlateModalOpen, setSmartPlateModalOpen] = useState(false);
    const [isLoadingSmartPlate, setIsLoadingSmartPlate] = useState(false);
    const [smartPlateError, setSmartPlateError] = useState<string | null>(null);

    // Food Bank requirement requests
    const [requirementRequests, setRequirementRequests] = usePersistentState<RequirementRequest[]>('pantrix-requirementRequests', []);
    const [wasteHotspots, setWasteHotspots] = usePersistentState<WasteHotspot[]>('pantrix-wasteHotspots', []);

    // Notifications state
    const [notifications, setNotifications] = usePersistentState<Notification[]>('pantrix-notifications', []);
    const [isNotificationsModalOpen, setNotificationsModalOpen] = useState(false);
    const unreadNotificationCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    // Cooked Food state
    const [cookedFoodItems, setCookedFoodItems] = usePersistentState<CookedFoodItem[]>('pantrix-cookedFood', []);
    const [cookedFoodOrders, setCookedFoodOrders] = usePersistentState<CookedFoodOrder[]>('pantrix-cookedFoodOrders', []);
    const [isAnnounceFoodModalOpen, setAnnounceFoodModalOpen] = useState(false);
    const [claimableFoodItem, setClaimableFoodItem] = useState<CookedFoodItem | null>(null);
    const [trackableOrder, setTrackableOrder] = useState<CookedFoodOrder | null>(null);
    const [assignableOrder, setAssignableOrder] = useState<CookedFoodOrder | null>(null);


    const membershipTier = useMemo(() => {
        if (userType !== 'hotel') return null;
        return getMembershipTier(donationCount);
    }, [donationCount, userType]);

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDateIn = (days: number): string => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return formatDate(d);
    };

    const getDateAgo = (days: number): string => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return formatDate(d);
    };


    // Data loading effect for new users
    useEffect(() => {
        // Only populate with initial demo data if the user is logged in and inventory is empty.
        if (userType && inventory.length === 0 && (currentPage === 'pantry' || currentPage === 'hotel-pantry')) {
            const initialItems: InventoryItemType[] = [
                 { id: '3', name: 'Bread', expiryDate: getDateIn(1), quantity: userType === 'hotel' ? '20 Loaves' : '1 Loaf', category: 'Bakery' },
                 { id: '20', name: 'Avocadoes', expiryDate: getDateIn(2), quantity: userType === 'hotel' ? '40 units': '2 units', category: 'Produce' },
                { id: '4', name: 'Chicken Breast', expiryDate: getDateIn(2), quantity: userType === 'hotel' ? '50 lbs' : '1 lb', category: 'Meat' },
                { id: '31', name: 'Old Berries', expiryDate: getDateAgo(2), quantity: '1 pint', category: 'Produce' },
                { id: '1', name: 'Milk', expiryDate: getDateIn(3), quantity: userType === 'hotel' ? '12 Gallons' : '0.5 Gallon', category: 'Dairy' },
                { id: '10', name: 'Potatoes', expiryDate: getDateIn(4), quantity: userType === 'hotel' ? '50 lbs bag' : '2 lbs', category: 'Produce' },
                { id: '11', name: 'Onions', expiryDate: getDateIn(5), quantity: userType === 'hotel' ? '25 lbs bag' : '1 lb', category: 'Produce' },
                { id: '2', name: 'Eggs', expiryDate: getDateIn(10), quantity: userType === 'hotel' ? '10 Dozen' : '1 Dozen', category: 'Dairy' },
                { id: '7', name: 'Cheese', expiryDate: getDateIn(20), quantity: userType === 'hotel' ? '15 lbs' : '8 oz', category: 'Dairy' },
                { id: '5', name: 'Spinach', expiryDate: getDateIn(5), quantity: userType === 'hotel' ? '5 lbs' : '1 bag', category: 'Produce' },
                { id: '6', name: 'Tomatoes', expiryDate: getDateIn(6), quantity: userType === 'hotel' ? '30 lbs' : '1 lb', category: 'Produce' },
                { id: '8', name: 'Pasta', expiryDate: getDateIn(30), quantity: userType === 'hotel' ? '20 boxes' : '1 box', category: 'Pantry' },
            ];
            const sortedItems = initialItems.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
            setInventory(sortedItems);

            // Add demo cooked food items if they don't exist, to make the feature visible
            if (cookedFoodItems.length === 0) {
                const initialCookedFood: CookedFoodItem[] = [
                    {
                        id: 'cooked-demo-1',
                        name: 'Paneer Butter Masala',
                        description: 'Freshly made paneer in a rich tomato and butter gravy. Perfect with naan or rice.',
                        quantity: '3',
                        allergens: 'Dairy, Nuts',
                        availableUntil: '21:00',
                        hotelName: 'The Grand Eatery',
                        hotelLocation: 'New York, USA',
                        hotelId: 'hotel-demo-1',
                        status: 'available',
                    },
                    {
                        id: 'cooked-demo-2',
                        name: 'Vegetable Fried Rice',
                        description: 'A generous portion of fried rice with mixed vegetables, enough for a small family.',
                        quantity: '4',
                        availableUntil: '22:00',
                        hotelName: 'Sunset Bistro',
                        hotelLocation: 'Los Angeles, USA',
                        hotelId: 'hotel-demo-2',
                        status: 'available',
                    }
                ];
                setCookedFoodItems(initialCookedFood);
            }

            if (userType === 'hotel') {
                 const expiringSoon = sortedItems.filter(item => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const expiry = new Date(item.expiryDate);
                    const diffTime = expiry.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    return diffDays <= 2 && diffDays >= 0;
                });
                if(expiringSoon.length > 0) {
                    handleFetchSmartRecipes(expiringSoon);
                }
            }
        }
    }, [userType, inventory.length, currentPage]);

    // Background geocoding for hotel
    useEffect(() => {
        if (userType === 'hotel' && hotelProfile && !hotelProfile.latitude && hotelProfile.location) {
            const fetchCoords = async () => {
                try {
                    const coords = await geocodeLocation(hotelProfile.location);
                    setHotelProfile(prev => prev ? { ...prev, latitude: coords.latitude, longitude: coords.longitude } : null);
                } catch (e) {
                    console.error("Failed to geocode hotel location:", e);
                }
            };
            fetchCoords();
        }
    }, [userType, hotelProfile]);

    // Background geocoding for food bank
    useEffect(() => {
        if (userType === 'food-bank' && foodBankProfile && !foodBankProfile.latitude && foodBankProfile.location) {
            const fetchCoords = async () => {
                try {
                    const coords = await geocodeLocation(foodBankProfile.location);
                    setFoodBankProfile(prev => prev ? { ...prev, latitude: coords.latitude, longitude: coords.longitude } : null);
                } catch (e) {
                    console.error("Failed to geocode food bank location:", e);
                }
            };
            fetchCoords();
        }
    }, [userType, foodBankProfile]);

    // Initial data population effect for food bank
    useEffect(() => {
        if (userType === 'food-bank' && foodBankProfile?.location && wasteHotspots.length === 0) {
            const fetchInitialData = async () => {
                try {
                    const location = foodBankProfile.location;
                    const [restaurantNames, hotspotData] = await Promise.all([
                        getBusinessNames(location, 'restaurant'),
                        getWasteHotspots(location)
                    ]);
                    
                    const sampleItemsPool = [
                        [{ id: 'd1', name: 'Potatoes', expiryDate: getDateIn(2), quantity: '20 lbs', category: 'Produce' }, { id: 'd2', name: 'Carrots', expiryDate: getDateIn(3), quantity: '15 lbs', category: 'Produce' }],
                        [{ id: 'd3', name: 'Chicken Thighs', expiryDate: getDateIn(1), quantity: '30 lbs', category: 'Meat' }],
                        [{ id: 'd4', name: 'Baguettes', expiryDate: getDateIn(0), quantity: '25 loaves', category: 'Bakery' }],
                        [{ id: 'd5', name: 'Cheddar Cheese', expiryDate: getDateIn(5), quantity: '10 lbs', category: 'Dairy' }],
                        [{ id: 'd6', name: 'Ground Beef', expiryDate: getDateIn(1), quantity: '22 lbs', category: 'Meat' }],
                        [{ id: 'd7', name: 'Lettuce Heads', expiryDate: getDateIn(2), quantity: '15 heads', category: 'Produce' }],
                    ];
                    const statuses: Array<'pending' | 'accepted' | 'completed'> = ['pending', 'accepted', 'completed', 'pending', 'pending', 'accepted'];
                    
                    const generatedRequests = restaurantNames.map((restaurantName, index) => {
                        const status = statuses[index % statuses.length];
                        const request: DonationRequest = {
                            id: `gen-don-${Date.now()}-${index}`,
                            restaurantName: restaurantName,
                            location: location,
                            items: sampleItemsPool[index % sampleItemsPool.length].map(item => ({...item, id: `${item.id}-${index}`})),
                            status: status,
                        };
                        if (status === 'completed') {
                            request.donationDate = getDateAgo(index * 2 + 1);
                        }
                        return request;
                    });
        
                    const generatedHotspots = hotspotData.map((hotspot, index) => ({
                        ...hotspot,
                        id: `hotspot-${Date.now()}-${index}`,
                    }));
        
                    setDonationRequests(generatedRequests);
                    setWasteHotspots(generatedHotspots);

                } catch (e) {
                    console.error("Failed to fetch initial data for food bank:", e);
                }
            };
            fetchInitialData();
        }
    }, [userType, foodBankProfile, wasteHotspots.length]);

    // Derived state for dashboards
    const { expiringSoonItems, bulkExpiringItems, expiredCount, expiringSoonCount, priorityItems, expiringSoon } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const getDaysDiff = (expiryDate: string) => {
            const [year, month, day] = expiryDate.split('-').map(Number);
            const expiry = new Date(year, month - 1, day);
            const diffTime = expiry.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        const expiringSoon = inventory.filter(item => {
            const diffDays = getDaysDiff(item.expiryDate);
            return diffDays <= 3 && diffDays >= 0;
        });
        
        const bulkExpiring = inventory.filter(item => {
            const diffDays = getDaysDiff(item.expiryDate);
            const quantityNum = parseFloat(item.quantity);
            return diffDays <= 7 && diffDays >= 0 && quantityNum > 10;
        });

        const expired = inventory.filter(item => getDaysDiff(item.expiryDate) < 0);

        const hotelExpiringSoon = inventory.filter(item => {
            const diffDays = getDaysDiff(item.expiryDate);
            return diffDays <= 2 && diffDays >= 0;
        });

        return {
            expiringSoonItems: hotelExpiringSoon,
            bulkExpiringItems: bulkExpiring,
            expiredCount: expired.length,
            expiringSoonCount: expiringSoon.length,
            priorityItems: expiringSoon.slice(0, 3),
            expiringSoon,
        };
    }, [inventory]);


    const handleAddItem = (item: Omit<InventoryItemType, 'id'>) => {
        const newItem: InventoryItemType = {
            ...item,
            id: new Date().getTime().toString(),
        };
        setInventory(prev => [...prev, newItem].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
        setAddModalOpen(false);
    };

    const handleAddScannedItems = (items: Omit<InventoryItemType, 'id'>[]) => {
        const newItems: InventoryItemType[] = items.map(item => ({
            ...item,
            id: `scan-${new Date().getTime()}-${Math.random()}`,
        }));
        setInventory(prev => [...prev, ...newItems].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
        setScanBillModalOpen(false);
    };

    const handleDeleteItem = (id: string) => {
        setInventory(prev => prev.filter(item => item.id !== id));
    };

    const handleFetchRecipes = useCallback(async (item: InventoryItemType) => {
        setSelectedItem(item);
        setRecipeModalOpen(true);
        setIsLoadingRecipes(true);
        setError(null);
        setRecipes([]);
        try {
            const recipeData = await getRecipeSuggestions(item.name, userProfile, language);
            setRecipes(recipeData);
        } catch (err) {
            setError(t('recipeModal.error'));
            console.error(err);
        } finally {
            setIsLoadingRecipes(false);
        }
    }, [t, userProfile, language]);

    const handleFetchSmartRecipes = useCallback(async (items: InventoryItemType[]) => {
        setIsLoadingSmartRecipes(true);
        setSmartRecipes([]);
        try {
            const recipes = await getSmartRecipes(items.map(i => i.name), userProfile, language);
            setSmartRecipes(recipes);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingSmartRecipes(false);
        }
    }, [userProfile, language]);

    const handleGenerateSmartPlate = useCallback(async (items: InventoryItemType[]) => {
        if (items.length === 0) return;
        setIsLoadingSmartPlate(true);
        setSmartPlateError(null);
        setSmartPlate(null);
        setSmartPlateModalOpen(true);
        try {
            const plate = await generateSmartPlate(items.map(i => i.name), userProfile, language);
            setSmartPlate(plate);
        } catch (err) {
            setSmartPlateError(t('dashboard.meal_plan_error'));
            console.error(err);
        } finally {
            setIsLoadingSmartPlate(false);
        }
    }, [t, userProfile, language]);
    
    const handleGenerateShoppingList = useCallback(async () => {
        setIsLoadingShoppingList(true);
        try {
            const suggestions = await getShoppingListSuggestions(inventory);
            const newList: ShoppingListItemType[] = suggestions.map(s => ({
                ...s,
                id: `ai-${new Date().getTime()}-${Math.random()}`,
                checked: false,
                isAiGenerated: true,
            }));
            setShoppingList(prev => [...prev.filter(i => !i.isAiGenerated), ...newList]);
        } catch (err) {
            console.error(err);
            alert("Could not generate shopping list.");
        } finally {
            setIsLoadingShoppingList(false);
        }
    }, [inventory, setShoppingList]);

    const handleUpdateShoppingListItem = (id: string, updates: Partial<ShoppingListItemType>) => {
        setShoppingList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleDeleteShoppingListItem = (id: string) => {
        setShoppingList(prev => prev.filter(item => item.id !== id));
    };

    const handleAddShoppingListItem = (item: { name: string; quantity: string; notes?: string }) => {
        const newItem: ShoppingListItemType = {
            id: `manual-${new Date().getTime()}`,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
            reason: 'Manually added',
            checked: false,
            isAiGenerated: false,
        };
        setShoppingList(prev => [...prev, newItem]);
    };

    const handleCreateDonationRequest = (details: {
        itemsToDonate: InventoryItemType[];
        ngoName: string;
        deliveryType: 'pickup' | 'dropoff';
        pickupDateTime?: string;
        notes?: string;
    }) => {
        if (!hotelProfile) return;
        const newRequest: DonationRequest = {
            id: `don-${new Date().getTime()}`,
            restaurantName: hotelProfile.name,
            location: hotelProfile.location,
            items: details.itemsToDonate,
            status: 'pending',
            ngoName: details.ngoName,
            deliveryType: details.deliveryType,
            pickupDateTime: details.pickupDateTime,
            notes: details.notes,
        };
        setDonationRequests(prev => [newRequest, ...prev]);
        setInventory(prev => prev.filter(item => !details.itemsToDonate.some(donated => donated.id === item.id)));
        setDonationCount(prev => prev + 1);
        setCreateDonationModalOpen(false);
        alert('Donation request sent!');
    };
    
    const handleAcceptDonation = (id: string) => {
        setDonationRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'accepted' } : req));
    };

    const handleDeclineDonation = (id: string) => {
        setDonationRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'declined' } : req));
    };

    const handleCompleteDonation = (id: string) => {
        setDonationRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'completed', donationDate: new Date().toISOString().split('T')[0] } : req));
    };
    
    const handleCreateRequirementRequest = (requestData: Omit<RequirementRequest, 'id' | 'timestamp'>) => {
        const newRequest: RequirementRequest = {
            ...requestData,
            id: `req-${new Date().getTime()}`,
            timestamp: new Date().toISOString(),
        };
        setRequirementRequests(prev => [newRequest, ...prev]);

        const newNotification: Notification = {
            id: `notif-${new Date().getTime()}`,
            type: 'new_requirement',
            title: `New Urgent Need from ${requestData.foodBankName}`,
            message: `Requesting: ${requestData.requestedItems.join(', ')}. Message: "${requestData.message}"`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);

        alert('Your requirement request has been broadcast to all partner hotels!');
    };
    
    const handleMarkNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

     const handleAnnounceCookedFood = (item: Omit<CookedFoodItem, 'id' | 'hotelName' | 'hotelLocation' | 'hotelId' | 'status'>) => {
        if (!hotelProfile) return;
        const newItem: CookedFoodItem = {
            ...item,
            id: `cooked-${new Date().getTime()}`,
            hotelId: hotelProfile.id,
            hotelName: hotelProfile.name,
            hotelLocation: hotelProfile.location,
            status: 'available',
        };
        setCookedFoodItems(prev => [newItem, ...prev]);
        setAnnounceFoodModalOpen(false);
    };

    const handleClaimCookedFood = (details: { address: string; contact: string; }) => {
        if (!claimableFoodItem) return;
        const currentUserProfile = userType === 'public' ? userProfile : foodBankProfile;
        if (!currentUserProfile) return;

        const newOrder: CookedFoodOrder = {
            id: `order-${new Date().getTime()}`,
            orderId: `PANTRIX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            foodItemId: claimableFoodItem.id,
            foodItemName: claimableFoodItem.name,
            hotelId: claimableFoodItem.hotelId,
            hotelName: claimableFoodItem.hotelName,
            hotelLocation: claimableFoodItem.hotelLocation,
            orderedBy: currentUserProfile.name,
            orderedById: currentUserProfile.id,
            userType: userType as 'public' | 'food-bank',
            deliveryAddress: details.address,
            contactNumber: details.contact,
            orderTimestamp: new Date().toISOString(),
            status: 'placed',
            estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
        };

        setCookedFoodOrders(prev => [newOrder, ...prev]);
        setCookedFoodItems(prev => prev.map(item => item.id === claimableFoodItem.id ? { ...item, status: 'claimed' } : item));

        // Create notification for the hotel
        const newNotification: Notification = {
            id: `notif-order-${new Date().getTime()}`,
            type: 'new_cooked_food_order',
            title: `New Order: ${claimableFoodItem.name}`,
            message: `An order was placed by ${currentUserProfile.name}. Please confirm and prepare for delivery.`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        // This assumes a global notification system. For a real app, this would be targeted.
        setNotifications(prev => [newNotification, ...prev]);

        setClaimableFoodItem(null);
        alert(t('cookedFood.order_placed_message'));
        if (userType === 'public') {
            setPublicView('my_orders');
        }
    };
    
    const handleUpdateCookedFoodOrderStatus = (orderId: string, status: CookedFoodOrder['status'], deliveryPerson?: { name: string; phone: string }) => {
        setCookedFoodOrders(prev => prev.map(order => {
            if (order.id === orderId) {
                const updatedOrder = { ...order, status };
                if (deliveryPerson) {
                    updatedOrder.deliveryPerson = deliveryPerson;
                }
                if (status === 'out_for_delivery') {
                    updatedOrder.estimatedDeliveryTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins from now
                }
                 if (status === 'delivered') {
                    updatedOrder.estimatedDeliveryTime = new Date().toISOString();
                }
                return updatedOrder;
            }
            return order;
        }));
        setAssignableOrder(null);
    };

    const handlePublicSignUp = (profile: UserProfile) => {
        setUserType('public');
        setUserProfile(profile);
        setPublicView('dashboard');
        setCurrentPage('pantry');
    };

    const handlePublicLogin = (name: string, email: string, location: string) => {
        console.log(`Logging in with ${email} from ${location}`);
        setUserType('public');
        setUserProfile({
            id: `user-${new Date().getTime()}`,
            name: name,
            email: email,
            country: location,
            weight: 70,
            weightUnit: 'kg',
            height: 175,
            heightUnit: 'cm',
            preferences: ['Vegetarian'],
        });
        setPublicView('dashboard');
        setCurrentPage('pantry');
    };

    const handleHotelLogin = (name: string, location: string, email: string) => {
        setUserType('hotel');
        setHotelProfile({ name, location, email, id: `hotel-${new Date().getTime()}` });
        setHotelView('dashboard');
        setCurrentPage('hotel-pantry');
        // Set a sample donation count if it's the default user
        if (email === 'manager@example.com' && donationCount === 0) {
            setDonationCount(12);
        }
    };
    
    const handleHotelSignUp = (profile: HotelProfile) => {
        setUserType('hotel');
        setHotelProfile({ ...profile, id: `hotel-${new Date().getTime()}` });
        setHotelView('dashboard');
        setCurrentPage('hotel-pantry');
        setDonationCount(0);
    };

    const handleFoodBankLogin = (name: string, location: string, email: string, darpanId: string) => {
        setUserType('food-bank');
        setFoodBankProfile({ name, location, email, darpanId, id: `fb-${new Date().getTime()}` });
        setCurrentPage('food-bank-dashboard');
    };

    const handleFoodBankSignUp = (profile: FoodBankProfile) => {
        setUserType('food-bank');
        setFoodBankProfile({ ...profile, id: `fb-${new Date().getTime()}` });
        setCurrentPage('food-bank-dashboard');
    };

    const handleLogout = () => {
        setCurrentPage('welcome');
        setUserType(null);
        // Clear user-specific data
        setInventory([]);
        setUserProfile(null);
        setHotelProfile(null);
        setFoodBankProfile(null);
        setDonationCount(0);
        setShoppingList([]);
        setWasteHotspots([]);

        // Shared data like donation requests, notifications, and cooked food items
        // are intentionally not cleared to simulate a persistent backend
        // for this multi-user demo.
    };
    
    const handleGenerateVideo = (recipe: Recipe) => {
        setRecipeModalOpen(false);
        setVideoRecipe(recipe);
    };

    const handleOpenEditProfile = () => {
        setPreviousPage(currentPage);
        setProfileModalOpen(false);
        setCurrentPage('edit-profile');
    };
    
    const handleUpdateProfile = (updatedData: UserProfile | HotelProfile | FoodBankProfile) => {
        if (userType === 'public') {
            setUserProfile(updatedData as UserProfile);
        } else if (userType === 'hotel') {
            setHotelProfile(updatedData as HotelProfile);
        } else if (userType === 'food-bank') {
            setFoodBankProfile(updatedData as FoodBankProfile);
        }
        alert('Profile updated successfully!');
        setCurrentPage(previousPage);
    };

    const renderPage = () => {
        const headerProps = {
            onAddItem: () => setAddModalOpen(true),
            onScanBill: () => setScanBillModalOpen(true),
            onOpenSettings: () => setSettingsModalOpen(true),
            onOpenProfile: () => setProfileModalOpen(true),
            userType: userType,
            userName: userType === 'hotel' ? hotelProfile?.name : userType === 'food-bank' ? foodBankProfile?.name : userProfile?.name,
            unreadNotificationCount: userType === 'hotel' ? unreadNotificationCount : 0,
            onOpenNotifications: () => {
                setNotificationsModalOpen(true);
                handleMarkNotificationsAsRead();
            },
        };
        switch (currentPage) {
            case 'welcome':
                return <Welcome onSelectPublic={() => setCurrentPage('public-login')} onSelectHotel={() => setCurrentPage('hotel-login')} onSelectFoodBank={() => setCurrentPage('food-bank-login')}/>;
            case 'public-signup':
                return <PublicSignUp onSignUp={handlePublicSignUp} onBack={() => setCurrentPage('welcome')} onGoToLogin={() => setCurrentPage('public-login')} />;
            case 'public-login':
                return <PublicLoginPage onLogin={handlePublicLogin} onBack={() => setCurrentPage('welcome')} onGoToSignUp={() => setCurrentPage('public-signup')} />;
            case 'hotel-login':
                return <HotelLogin onLogin={handleHotelLogin} onBack={() => setCurrentPage('welcome')} onGoToSignUp={() => setCurrentPage('hotel-signup')}/>;
            case 'hotel-signup':
                return <HotelSignUp onSignUp={handleHotelSignUp} onBack={() => setCurrentPage('welcome')} onGoToLogin={() => setCurrentPage('hotel-login')} />;
            case 'food-bank-login':
                return <FoodBankLogin onLogin={handleFoodBankLogin} onBack={() => setCurrentPage('welcome')} onGoToSignUp={() => setCurrentPage('food-bank-signup')} />;
            case 'food-bank-signup':
                return <FoodBankSignUp onSignUp={handleFoodBankSignUp} onBack={() => setCurrentPage('welcome')} onGoToLogin={() => setCurrentPage('food-bank-login')} />;
            case 'edit-profile':
                 return (
                    <EditProfilePage
                        userType={userType!}
                        profile={{ userProfile, hotelProfile, foodBankProfile }}
                        onUpdate={handleUpdateProfile}
                        onBack={() => setCurrentPage(previousPage)}
                    />
                );
            case 'pantry':
                if (publicView === 'healthbot') {
                    return (
                        <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm z-20 p-2 sm:p-4 flex items-center justify-center animate-healthbot-fade-in">
                             <style>{`
                                @keyframes healthbot-fade-in {
                                    from { opacity: 0; }
                                    to { opacity: 1; }
                                }
                                .animate-healthbot-fade-in { animation: healthbot-fade-in 0.3s ease-out forwards; }
                             `}</style>
                            <HealthBot onClose={() => setPublicView('dashboard')} />
                        </div>
                    );
                }
                return (
                    <>
                        <Header {...headerProps} />
                        <main className="container mx-auto px-4 py-8">
                            <PublicNav activeView={publicView} setView={setPublicView} />
                            <div className="mt-8">
                                {publicView === 'dashboard' && (
                                    <Dashboard 
                                        totalItems={inventory.length}
                                        expiringSoonCount={expiringSoonCount}
                                        expiredCount={expiredCount}
                                        priorityItems={priorityItems}
                                        onGetRecipes={handleFetchRecipes}
                                        onDeleteItem={handleDeleteItem}
                                        expiringSoonItems={expiringSoon}
                                        isLoadingSmartPlate={isLoadingSmartPlate}
                                        onGenerateSmartPlate={handleGenerateSmartPlate}
                                        cookedFoodItems={cookedFoodItems}
                                        onClaimCookedFood={(item) => setClaimableFoodItem(item)}
                                    />
                                )}
                                {publicView === 'inventory' && (
                                    <InventoryList
                                        items={inventory}
                                        onDeleteItem={handleDeleteItem}
                                        onGetRecipes={handleFetchRecipes}
                                    />
                                )}
                                {publicView === 'shopping-list' && (
                                    <ShoppingList 
                                        items={shoppingList}
                                        isLoading={isLoadingShoppingList}
                                        onGenerate={handleGenerateShoppingList}
                                        onUpdateItem={handleUpdateShoppingListItem}
                                        onDeleteItem={handleDeleteShoppingListItem}
                                        onAddItem={handleAddShoppingListItem}
                                    />
                                )}
                                {publicView === 'my_orders' && (
                                    <CookedFoodOrdersPage 
                                        orders={cookedFoodOrders.filter(o => o.orderedById === userProfile?.id)}
                                        onTrackOrder={(order) => setTrackableOrder(order)}
                                    />
                                )}
                                {publicView === 'knowledge' && (
                                    <KnowledgeCenter />
                                )}
                            </div>
                        </main>
                        <button
                            onClick={() => setPublicView('healthbot')}
                            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-secondary text-white p-4 rounded-full shadow-lg hover:bg-blue-500 transition-all duration-300 transform hover:scale-110 z-10 animate-button-pop-in"
                            aria-label="Open Health Assistant"
                        >
                            <BotIcon className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <style>{`
                            @keyframes button-pop-in {
                                from { transform: scale(0.5) rotate(-15deg); opacity: 0; }
                                to { transform: scale(1) rotate(0deg); opacity: 1; }
                            }
                            .animate-button-pop-in { animation: button-pop-in 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0.5s forwards; opacity: 0; }
                        `}</style>
                    </>
                );
             case 'hotel-pantry':
                return (
                    <>
                         <Header {...headerProps} />
                         <main className="container mx-auto px-4 py-8">
                            <HotelNav activeView={hotelView} setView={setHotelView} />
                            <div className="mt-8">
                                {hotelView === 'dashboard' ? (
                                    <HotelPantry
                                        expiringSoonItems={expiringSoonItems}
                                        bulkExpiringItems={bulkExpiringItems}
                                        smartRecipes={smartRecipes}
                                        isLoadingSmartRecipes={isLoadingSmartRecipes}
                                        onOpenCreateDonationModal={() => setCreateDonationModalOpen(true)}
                                        donationCount={donationCount}
                                        membershipTier={membershipTier}
                                        requirementRequests={requirementRequests}
                                    />
                                ) : hotelView === 'inventory' ? (
                                    <InventoryList
                                        items={inventory}
                                        onDeleteItem={handleDeleteItem}
                                        onGetRecipes={handleFetchRecipes}
                                        showRecipeButton={false}
                                    />
                                ) : (
                                    <LiveCookedFoodOrders
                                        announcedItems={cookedFoodItems.filter(item => item.hotelId === hotelProfile?.id)}
                                        orders={cookedFoodOrders.filter(order => order.hotelId === hotelProfile?.id)}
                                        onAnnounce={() => setAnnounceFoodModalOpen(true)}
                                        onUpdateStatus={handleUpdateCookedFoodOrderStatus}
                                        onAssignDelivery={(order) => setAssignableOrder(order)}
                                    />
                                )}
                            </div>
                         </main>
                    </>
                );
            case 'food-bank-dashboard':
                return (
                     <>
                        <Header {...headerProps} />
                        <main className="container mx-auto px-4 py-8">
                            <FoodBankDashboard 
                                requests={donationRequests}
                                onAccept={handleAcceptDonation}
                                onDecline={handleDeclineDonation}
                                onComplete={handleCompleteDonation}
                                foodBankProfile={foodBankProfile}
                                onCreateRequirementRequest={handleCreateRequirementRequest}
                                wasteHotspots={wasteHotspots}
                                cookedFoodItems={cookedFoodItems}
                                onClaimCookedFood={(item) => setClaimableFoodItem(item)}
                                cookedFoodOrders={cookedFoodOrders.filter(o => o.orderedById === foodBankProfile?.id)}
                                onTrackOrder={(order) => setTrackableOrder(order)}
                            />
                        </main>
                    </>
                );
            default:
                 return <Welcome onSelectPublic={() => setCurrentPage('public-signup')} onSelectHotel={() => setCurrentPage('hotel-login')} onSelectFoodBank={() => setCurrentPage('food-bank-login')} />;
        }
    };

    return (
        <div className="bg-dark-bg min-h-screen font-sans text-text-light">
            {renderPage()}

            {isScanBillModalOpen && (
                 <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                >
                    <ScanBillModal onClose={() => setScanBillModalOpen(false)} onAddItems={handleAddScannedItems} />
                </div>
            )}
            
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title={t('addItem.title')}>
                <AddItemForm onAddItem={handleAddItem} onCancel={() => setAddModalOpen(false)} />
            </Modal>

            {selectedItem && (
                 <Modal isOpen={isRecipeModalOpen} onClose={() => setRecipeModalOpen(false)} title={`${t('recipeModal.title')} ${selectedItem.name}`}>
                    <RecipeModal isLoading={isLoadingRecipes} recipes={recipes} error={error} onGenerateVideo={handleGenerateVideo} />
                </Modal>
            )}
            
            <Modal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} title={t('settings.title')}>
                <SettingsModal onClose={() => setSettingsModalOpen(false)} />
            </Modal>
            
            {isProfileModalOpen && userType && (
                <Modal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} title={t('profile.title')}>
                     <ProfileModal
                        onClose={() => setProfileModalOpen(false)}
                        onLogout={handleLogout}
                        onEditProfile={handleOpenEditProfile}
                        userType={userType}
                        userName={
                            userType === 'public' ? userProfile!.name :
                            userType === 'hotel' ? hotelProfile!.name :
                            foodBankProfile!.name
                        }
                        userEmail={
                           userType === 'public' ? userProfile!.email :
                           userType === 'hotel' ? hotelProfile!.email :
                           foodBankProfile!.email
                        }
                        userLocation={
                            userType === 'public' ? userProfile?.country :
                            userType === 'hotel' ? hotelProfile?.location :
                            foodBankProfile?.location
                        }
                        itemsSaved={userType === 'public' ? 5 : undefined}
                        membershipTier={membershipTier}
                    />
                </Modal>
            )}

            <Modal isOpen={isSmartPlateModalOpen} onClose={() => setSmartPlateModalOpen(false)} title={t('dashboard.meal_plan_title')}>
                <SmartPlateModal 
                    data={smartPlate}
                    isLoading={isLoadingSmartPlate}
                    error={smartPlateError}
                />
            </Modal>
            
            <VideoGeneratorModal isOpen={!!videoRecipe} onClose={() => setVideoRecipe(null)} recipe={videoRecipe} />

            {isCreateDonationModalOpen && userType === 'hotel' && hotelProfile && (
                <CreateDonationModal
                    isOpen={isCreateDonationModalOpen}
                    onClose={() => setCreateDonationModalOpen(false)}
                    inventory={inventory}
                    preselectedItems={bulkExpiringItems}
                    restaurantLocation={hotelProfile.location}
                    restaurantCoords={hotelProfile.latitude && hotelProfile.longitude ? { latitude: hotelProfile.latitude, longitude: hotelProfile.longitude } : undefined}
                    onCreateDonation={handleCreateDonationRequest}
                />
            )}
            
            <NotificationsModal 
                isOpen={isNotificationsModalOpen} 
                onClose={() => setNotificationsModalOpen(false)} 
                notifications={notifications}
            />

            <AnnounceCookedFoodModal
                isOpen={isAnnounceFoodModalOpen}
                onClose={() => setAnnounceFoodModalOpen(false)}
                onAnnounce={handleAnnounceCookedFood}
            />

            <ClaimCookedFoodModal
                isOpen={!!claimableFoodItem}
                onClose={() => setClaimableFoodItem(null)}
                foodItem={claimableFoodItem}
                onClaim={handleClaimCookedFood}
            />
            
            <TrackOrderModal
                isOpen={!!trackableOrder}
                onClose={() => setTrackableOrder(null)}
                order={trackableOrder}
            />

            {assignableOrder && hotelProfile && (
                <AssignDeliveryModal
                    isOpen={!!assignableOrder}
                    onClose={() => setAssignableOrder(null)}
                    order={assignableOrder}
                    onAssign={(deliveryPerson) => handleUpdateCookedFoodOrderStatus(assignableOrder.id, 'out_for_delivery', deliveryPerson)}
                    hotelLocation={hotelProfile.location}
                />
            )}


        </div>
    );
};

const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);

export default App;