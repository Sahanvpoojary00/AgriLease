export type UserRole = 'farmer' | 'landowner' | 'admin' | 'vendor';

export interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    website: string | null;
    role: UserRole | null;
    phone: string | null;
    language: string;
    updated_at: string | null;
    state: string | null;
    district: string | null;
    pin_code: string | null;
    latitude: number | null;
    longitude: number | null;
    shop_name: string | null;
    business_address: string | null;
    is_verified: boolean;
}

export interface Listing {
    id: string;
    created_at: string;
    owner_id: string;
    title: string;
    description: string | null;
    pin_code: string;
    state: string | null;
    district: string | null;
    area_size: number;
    price_expected: number | null;
    status: 'active' | 'leased' | 'inactive';
    image_urls: string[] | null;
    soil_type: string | null;
    survey_id: string | null;
    profit_share_percent: number | null;
    legal_terms: string | null;
    latitude: number | null;
    longitude: number | null;
    verified: boolean;
    // joined
    profiles?: Profile;
}

export interface Application {
    id: string;
    created_at: string;
    listing_id: string;
    farmer_id: string;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    // joined
    listings?: Listing;
    profiles?: Profile;
}

export interface Conversation {
    id: string;
    listing_id: string;
    farmer_id: string;
    landowner_id: string;
    status: 'active' | 'closed';
    created_at: string;
    // joined
    listings?: Listing;
    farmer?: Profile;
    landowner?: Profile;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender?: Profile;
}

export interface Contract {
    id: string;
    application_id: string | null;
    listing_id: string;
    farmer_id: string;
    landowner_id: string;
    lease_start: string;
    lease_end: string;
    profit_share_percent: number;
    rent_amount: number | null;
    terms: string | null;
    farmer_signed_at: string | null;
    landowner_signed_at: string | null;
    status: 'draft' | 'farmer_signed' | 'active' | 'completed' | 'cancelled';
    created_at: string;
    // joined
    listings?: Listing;
    farmer?: Profile;
    landowner?: Profile;
}

export const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat', 'Chalk', 'Black Cotton', 'Red Laterite'] as const;
export type SoilType = typeof SOIL_TYPES[number];

export interface WeatherData {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    lastUpdated: string;
    icon: string;
}

export interface MarketPrice {
    commodity: string;
    price: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
}
export interface Diagnosis {
    id: string;
    user_id: string;
    image_url: string | null;
    plant_name: string | null;
    disease_name: string | null;
    confidence: number | null;
    is_healthy: boolean;
    treatment_suggestions: string | null;
    created_at: string;
}

export interface Product {
    id: string;
    vendor_id: string;
    name: string;
    description: string | null;
    price: number;
    category: 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';
    image_url: string | null;
    pin_code: string | null;
    stock_quantity: number;
    created_at: string;
    // joined
    vendor?: Profile;
}

export interface Order {
    id: string;
    buyer_id: string;
    vendor_id: string;
    product_id: string;
    quantity: number;
    total_price: number;
    status: 'Pending' | 'Accepted' | 'Delivered' | 'Cancelled';
    delivery_address: string;
    phone_number: string;
    created_at: string;
    // joined
    buyer?: Profile;
    vendor?: Profile;
    product?: Product;
}
