// SLIIT Eats - Mock Data
// Copy this file to: src/constants/mockData.ts

export interface Canteen {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  isOpen: boolean;
  location: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  canteenId: string;
  rating: number;
  isAvailable: boolean;
  preparationTime: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  canteenName: string;
  createdAt: string;
  estimatedTime: string;
}

export const CANTEENS: Canteen[] = [
  {
    id: '1',
    name: 'Main Canteen',
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400',
    rating: 4.5,
    deliveryTime: '15-20 min',
    isOpen: true,
    location: 'Ground Floor, Main Building',
  },
  {
    id: '2',
    name: 'Tech Cafe',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    rating: 4.8,
    deliveryTime: '10-15 min',
    isOpen: true,
    location: 'IT Faculty Building',
  },
  {
    id: '3',
    name: 'Green Garden',
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400',
    rating: 4.2,
    deliveryTime: '20-25 min',
    isOpen: true,
    location: 'Near Library',
  },
  {
    id: '4',
    name: 'Quick Bites',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    rating: 4.6,
    deliveryTime: '5-10 min',
    isOpen: false,
    location: 'Student Center',
  },
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: '1',
    name: 'Chicken Fried Rice',
    description: 'Delicious fried rice with tender chicken pieces, vegetables, and special spices',
    price: 450,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    category: 'Rice',
    canteenId: '1',
    rating: 4.7,
    isAvailable: true,
    preparationTime: '12 min',
  },
  {
    id: '2',
    name: 'Kottu Roti',
    description: 'Sri Lankan style chopped roti with vegetables and your choice of protein',
    price: 380,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    category: 'Kottu',
    canteenId: '1',
    rating: 4.9,
    isAvailable: true,
    preparationTime: '15 min',
  },
  {
    id: '3',
    name: 'Submarine',
    description: 'Classic submarine sandwich with grilled chicken, cheese, and fresh vegetables',
    price: 320,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400',
    category: 'Snacks',
    canteenId: '1',
    rating: 4.4,
    isAvailable: true,
    preparationTime: '8 min',
  },
  {
    id: '4',
    name: 'Fresh Juice',
    description: 'Freshly squeezed fruit juice - Orange, Apple, or Mixed Fruit',
    price: 150,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    category: 'Beverages',
    canteenId: '1',
    rating: 4.6,
    isAvailable: true,
    preparationTime: '3 min',
  },
  {
    id: '5',
    name: 'Biryani',
    description: 'Aromatic basmati rice cooked with spices, herbs, and tender meat',
    price: 550,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    category: 'Rice',
    canteenId: '2',
    rating: 4.8,
    isAvailable: true,
    preparationTime: '18 min',
  },
  {
    id: '6',
    name: 'Noodles',
    description: 'Stir-fried noodles with vegetables and your choice of chicken or egg',
    price: 350,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    category: 'Noodles',
    canteenId: '2',
    rating: 4.5,
    isAvailable: true,
    preparationTime: '10 min',
  },
  {
    id: '7',
    name: 'Burger Combo',
    description: 'Juicy beef burger with fries and a soft drink',
    price: 520,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'Fast Food',
    canteenId: '3',
    rating: 4.3,
    isAvailable: false,
    preparationTime: '12 min',
  },
  {
    id: '8',
    name: 'Pasta',
    description: 'Creamy pasta with mushrooms and herbs',
    price: 420,
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
    category: 'Italian',
    canteenId: '3',
    rating: 4.4,
    isAvailable: true,
    preparationTime: '14 min',
  },
];

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'rice', name: 'Rice', icon: 'restaurant-outline' },
  { id: 'kottu', name: 'Kottu', icon: 'flame-outline' },
  { id: 'snacks', name: 'Snacks', icon: 'fast-food-outline' },
  { id: 'beverages', name: 'Drinks', icon: 'cafe-outline' },
  { id: 'noodles', name: 'Noodles', icon: 'nutrition-outline' },
];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ORD001',
    items: [
      { ...FOOD_ITEMS[0], quantity: 2 },
      { ...FOOD_ITEMS[3], quantity: 1 },
    ],
    total: 1050,
    status: 'preparing',
    canteenName: 'Main Canteen',
    createdAt: '2024-01-15T10:30:00',
    estimatedTime: '15 min',
  },
  {
    id: 'ORD002',
    items: [
      { ...FOOD_ITEMS[1], quantity: 1 },
    ],
    total: 380,
    status: 'ready',
    canteenName: 'Main Canteen',
    createdAt: '2024-01-15T09:45:00',
    estimatedTime: 'Ready!',
  },
  {
    id: 'ORD003',
    items: [
      { ...FOOD_ITEMS[4], quantity: 1 },
      { ...FOOD_ITEMS[5], quantity: 1 },
    ],
    total: 900,
    status: 'completed',
    canteenName: 'Tech Cafe',
    createdAt: '2024-01-14T12:00:00',
    estimatedTime: 'Completed',
  },
];
