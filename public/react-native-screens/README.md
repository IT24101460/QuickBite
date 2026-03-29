# SLIIT Eats - React Native Screens

A complete React Native mobile application for SLIIT Eats food ordering system with a vibrant orange theme.

## Features

### Screens Included

1. **HomeScreen** - Welcome interface with search, promotional banners, category browsing, and popular items
2. **CanteensScreen** - Browse and filter canteens by status (All/Open/Closed) with ratings and details
3. **FoodMenuScreen** - Detailed food menu with parallax header, category filtering, and item selection
4. **CartScreen** - Shopping cart with quantity controls, promo codes, and checkout functionality
5. **OrdersScreen** - Order tracking with active/history tabs and progress indicators

### Components

- **BottomNavigation** - Custom floating tab bar with cart badge indicator
- **AppNavigator** - React Navigation setup with stack and tab navigation

### Design System

- **Theme** - Vibrant orange color palette with consistent spacing and typography
- **Mock Data** - Sample data with TypeScript interfaces for development

## Installation

1. Copy the `react-native-screens` folder to your React Native project root
2. Install required dependencies:
   ```bash
   npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @expo/vector-icons
   ```
3. For Expo projects, also install:
   ```bash
   npx expo install react-native-screens react-native-safe-area-context
   ```

## Usage

1. Import the `AppNavigator` in your App.tsx:
   ```tsx
   import AppNavigator from './react-native-screens/navigation/AppNavigator';

   export default function App() {
     return <AppNavigator />;
   }
   ```

2. Replace mock data with actual API calls to your backend
3. Customize the theme colors and styling as needed

## API Integration

The app is designed to work with the backend API endpoints:

- `GET /foodItem` - Fetch food items
- `POST /orders` - Place new orders
- `GET /orders/my` - Get user's orders
- `PATCH /orders/:id/status` - Update order status

## File Structure

```
react-native-screens/
├── components/
│   └── BottomNavigation.tsx
├── constants/
│   ├── theme.ts
│   └── mockData.ts
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── CanteensScreen.tsx
│   ├── FoodMenuScreen.tsx
│   ├── CartScreen.tsx
│   └── OrdersScreen.tsx
└── README.md
```

## Customization

### Theme
Modify `constants/theme.ts` to change colors, spacing, and typography.

### Navigation
Update `navigation/AppNavigator.tsx` to add new screens or modify navigation flow.

### Components
Customize components in the `components/` folder for specific branding needs.

## Backend Integration

To connect with your backend:

1. Create API service functions in a new `services/` folder
2. Replace mock data imports with API calls
3. Add authentication handling for user-specific data
4. Implement real-time order status updates

Example API service structure:
```tsx
// services/api.ts
const API_BASE_URL = 'http://your-backend-url:3000';

export const getFoodItems = async () => {
  const response = await fetch(`${API_BASE_URL}/foodItem`);
  return response.json();
};

export const placeOrder = async (orderData: any) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return response.json();
};
```

## Dependencies

- React Navigation (Native, Stack, Bottom Tabs)
- Expo Vector Icons
- React Native core components

## Development

The screens are built with TypeScript for better development experience and type safety. All components are fully responsive and follow React Native best practices.