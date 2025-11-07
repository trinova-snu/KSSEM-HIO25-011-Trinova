import React, { useState, useEffect } from 'react';
import { UserProfile, HotelProfile, FoodBankProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeftIcon } from './icons';
import { TASTE_PREFERENCES } from './PublicLogin';
import LocationSelector from './LocationSelector';

type UserType = 'public' | 'hotel' | 'food-bank';

interface EditProfilePageProps {
    userType: UserType;
    profile: {
        userProfile: UserProfile | null;
        hotelProfile: HotelProfile | null;
        foodBankProfile: FoodBankProfile | null;
    };
    onUpdate: (data: any) => void;
    onBack: () => void;
}

const FormInput: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; required?: boolean }> = 
    ({ label, id, value, onChange, type = 'text', placeholder, required = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-dark mb-1">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
        />
    </div>
);

const FormSelect: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly string[] }> =
    ({ label, id, value, onChange, options }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-dark mb-1">{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


const EditProfilePage: React.FC<EditProfilePageProps> = ({ userType, profile, onUpdate, onBack }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (userType === 'public') setFormData(profile.userProfile);
        else if (userType === 'hotel') setFormData(profile.hotelProfile);
        else if (userType === 'food-bank') setFormData(profile.foodBankProfile);
    }, [userType, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLocationChange = (location: string) => {
        // Public user profile still has 'country' field. This is a temporary adaptation.
        const field = userType === 'public' ? 'country' : 'location';
        setFormData({ ...formData, [field]: location });
    };

    const handlePreferenceToggle = (pref: string) => {
        const currentPrefs = formData.preferences || [];
        const newPrefs = currentPrefs.includes(pref) 
            ? currentPrefs.filter((p: string) => p !== pref) 
            : [...currentPrefs, pref];
        setFormData({ ...formData, preferences: newPrefs });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
    };

    const renderPublicForm = () => (
        <>
            <h2 className="text-2xl font-bold text-text-light mb-1">Edit Public Profile</h2>
            <p className="text-text-dark mb-6">Update your personalization and health details.</p>
            <FormInput label="Name" id="name" value={formData.name || ''} onChange={handleChange} required />
            <FormInput label="Email" id="email" value={formData.email || ''} onChange={handleChange} type="email" required />
            <LocationSelector initialLocation={formData.country} onLocationChange={handleLocationChange} />
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Weight" id="weight" value={formData.weight || ''} onChange={handleChange} type="number" />
                <FormSelect label="Weight Unit" id="weightUnit" value={formData.weightUnit || 'kg'} onChange={handleChange} options={['kg', 'lbs']} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Height" id="height" value={formData.height || ''} onChange={handleChange} type="number" />
                <FormSelect label="Height Unit" id="heightUnit" value={formData.heightUnit || 'cm'} onChange={handleChange} options={['cm', 'in']} />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-dark mb-2">{t('signup.preferences_label')}</label>
                <div className="flex flex-wrap gap-2">
                    {TASTE_PREFERENCES.map(pref => (
                        <button
                            type="button"
                            key={pref}
                            onClick={() => handlePreferenceToggle(pref)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${(formData.preferences || []).includes(pref) ? 'bg-primary border-primary text-white' : 'bg-dark-bg border-border-color text-text-dark hover:border-primary'}`}
                        >
                            {pref}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );

    const renderHotelForm = () => (
        <>
            <h2 className="text-2xl font-bold text-text-light mb-1">Edit Hotel/Restaurant Profile</h2>
            <p className="text-text-dark mb-6">Update your business information.</p>
            <FormInput label="Restaurant Name" id="name" value={formData.name || ''} onChange={handleChange} required />
            <FormInput label="Business Email" id="email" value={formData.email || ''} onChange={handleChange} type="email" required />
            <LocationSelector initialLocation={formData.location} onLocationChange={handleLocationChange} />
            <FormInput label="Cuisine Type" id="cuisineType" value={formData.cuisineType || ''} onChange={handleChange} placeholder="e.g., Italian, Mexican" />
            <FormInput label="Contact Number" id="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} type="tel" placeholder="(123) 456-7890" />
        </>
    );

    const renderFoodBankForm = () => (
        <>
            <h2 className="text-2xl font-bold text-text-light mb-1">Edit Food Bank/NGO Profile</h2>
            <p className="text-text-dark mb-6">Update your organization's details.</p>
            <FormInput label="Organization Name" id="name" value={formData.name || ''} onChange={handleChange} required />
            <FormInput label="Organization Email" id="email" value={formData.email || ''} onChange={handleChange} type="email" required />
            <LocationSelector initialLocation={formData.location} onLocationChange={handleLocationChange} />
            <FormInput label="Contact Person" id="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} placeholder="e.g., Jane Doe" />
            <FormInput label="Phone Number" id="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} type="tel" placeholder="(123) 456-7890" />
            <FormInput label="Website" id="website" value={formData.website || ''} onChange={handleChange} type="url" placeholder="https://example.com" />
        </>
    );

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-dark-bg">
            <div className="w-full max-w-2xl">
                <button onClick={onBack} className="flex items-center gap-2 text-text-dark hover:text-text-light transition-colors mb-6">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>{t('login.back')}</span>
                </button>

                <form onSubmit={handleSubmit} className="space-y-4 bg-light-bg/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-border-color/50">
                    {userType === 'public' && renderPublicForm()}
                    {userType === 'hotel' && renderHotelForm()}
                    {userType === 'food-bank' && renderFoodBankForm()}
                    
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;