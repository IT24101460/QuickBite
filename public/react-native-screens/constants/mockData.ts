// TypeScript interfaces
export interface Canteen {
  id: string;
  name: string;
  image: string;
  rating: number;
  status: 'open' | 'closed';
  openingHours: string;
  location: string;
  categories: string[];
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
  isPopular: boolean;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryLocation: string;
  estimatedTime: string;
}

// Mock data
export const mockCanteens: Canteen[] = [
  {
    id: '1',
    name: 'Main Canteen',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    rating: 4.5,
    status: 'open',
    openingHours: '7:00 AM - 8:00 PM',
    location: 'Ground Floor',
    categories: ['Sri Lankan', 'Chinese', 'Beverages'],
  },
  {
    id: '2',
    name: 'Cafeteria',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    rating: 4.2,
    status: 'open',
    openingHours: '8:00 AM - 6:00 PM',
    location: 'Level 2',
    categories: ['Fast Food', 'Desserts', 'Coffee'],
  },
  {
    id: '3',
    name: 'Food Court',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    rating: 4.7,
    status: 'closed',
    openingHours: '11:00 AM - 9:00 PM',
    location: 'Level 3',
    categories: ['International', 'Healthy', 'Snacks'],
  },
];

export const mockFoodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Chicken Fried Rice',
    description: 'Delicious fried rice with tender chicken pieces and vegetables',
    price: 250,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    category: 'Sri Lankan',
    canteenId: '1',
    rating: 4.6,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Vegetable Noodles',
    description: 'Healthy vegetable noodles with authentic spices',
    price: 200,
    image: 'https://images.unsplash.com/photo-1551892376-c73a4e5b47e9?w=400',
    category: 'Chinese',
    canteenId: '1',
    rating: 4.3,
    isPopular: false,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Chicken Burger',
    description: 'Juicy chicken patty with fresh vegetables and special sauce',
    price: 350,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'Fast Food',
    canteenId: '2',
    rating: 4.8,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Chocolate Cake',
    description: 'Rich and moist chocolate cake with chocolate frosting',
    price: 150,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    category: 'Desserts',
    canteenId: '2',
    rating: 4.9,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Grilled Salmon',
    description: 'Fresh salmon fillet grilled to perfection with herbs',
    price: 450,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    category: 'International',
    canteenId: '3',
    rating: 4.7,
    isPopular: false,
    isAvailable: false,
  },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    items: [
      {
        id: '1',
        foodItem: mockFoodItems[0],
        quantity: 2,
        specialInstructions: 'Extra spicy',
      },
      {
        id: '2',
        foodItem: mockFoodItems[3],
        quantity: 1,
      },
    ],
    total: 650,
    status: 'preparing',
    createdAt: '2024-01-15T10:30:00Z',
    deliveryLocation: 'Room 201',
    estimatedTime: '15 mins',
  },
  {
    id: '2',
    items: [
      {
        id: '3',
        foodItem: mockFoodItems[2],
        quantity: 1,
      },
    ],
    total: 350,
    status: 'delivered',
    createdAt: '2024-01-14T12:00:00Z',
    deliveryLocation: 'Library',
    estimatedTime: 'Delivered',
  },
];

export const categories = [
  'All',
  'Sri Lankan',
  'Chinese',
  'Fast Food',
  'International',
  'Healthy',
  'Desserts',
  'Beverages',
];