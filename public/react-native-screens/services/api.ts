// API service for SLIIT Eats mobile app
// Replace with your actual backend URL
const API_BASE_URL = 'http://localhost:3000'; // Update this to your backend URL

// Types (matching backend models)
export interface FoodItem {
  _id: string;
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

export interface Order {
  _id: string;
  userId: string;
  items: {
    foodItem: FoodItem;
    quantity: number;
    specialInstructions?: string;
  }[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryLocation: string;
  estimatedTime: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// API Functions
export const apiService = {
  // Food Items
  getFoodItems: async (): Promise<FoodItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/foodItem`);
      if (!response.ok) throw new Error('Failed to fetch food items');
      return await response.json();
    } catch (error) {
      console.error('Error fetching food items:', error);
      throw error;
    }
  },

  getFoodItemById: async (id: string): Promise<FoodItem> => {
    try {
      const response = await fetch(`${API_BASE_URL}/foodItem/${id}`);
      if (!response.ok) throw new Error('Failed to fetch food item');
      return await response.json();
    } catch (error) {
      console.error('Error fetching food item:', error);
      throw error;
    }
  },

  // Orders
  placeOrder: async (orderData: {
    items: { foodItem: string; quantity: number; specialInstructions?: string }[];
    deliveryLocation: string;
  }): Promise<Order> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to place order');
      return await response.json();
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  getMyOrders: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/my`, {
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch order');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  cancelOrder: async (id: string): Promise<Order> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to cancel order');
      return await response.json();
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // User
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Registration failed');
      return await response.json();
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },
};

// Utility functions
export const formatPrice = (price: number): string => {
  return `Rs. ${price.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status: Order['status']): string => {
  const colors = {
    pending: '#FDCB6E',
    preparing: '#FF6B35',
    ready: '#00B894',
    delivered: '#00B894',
    cancelled: '#D63031',
  };
  return colors[status] || '#636E72';
};

export const getStatusIcon = (status: Order['status']): string => {
  const icons = {
    pending: 'time-outline',
    preparing: 'restaurant-outline',
    ready: 'checkmark-circle-outline',
    delivered: 'checkmark-circle',
    cancelled: 'close-circle',
  };
  return icons[status] || 'help-circle-outline';
};