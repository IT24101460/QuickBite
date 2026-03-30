# SLIIT Eats - React Native Screens

Modern, attractive food ordering app screens for the SLIIT campus canteen system.

## Features

- **Vibrant Orange Theme** - Warm, appetite-inducing color palette
- **Modern UI** - Clean, professional design with smooth shadows and rounded corners
- **5 Core Screens** - Home, Canteens, Food Menu, Cart, Orders
- **Reusable Components** - Bottom navigation with floating cart button
- **TypeScript Support** - Full type definitions included

## Installation

### 1. Copy files to your React Native project

```
src/
├── constants/
│   ├── theme.ts
│   └── mockData.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── CanteensScreen.tsx
│   ├── FoodMenuScreen.tsx
│   ├── CartScreen.tsx
│   └── OrdersScreen.tsx
├── components/
│   └── BottomNavigation.tsx
└── navigation/
    └── AppNavigator.tsx
```

### 2. Install required dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# Expo dependencies (if using Expo)
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Icons
npm install @expo/vector-icons
# OR for bare React Native:
npm install react-native-vector-icons
```

### 3. Update App.tsx

```tsx
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

## Customization

### Theme Colors

Edit `constants/theme.ts` to customize the color palette:

```ts
export const COLORS = {
  primary: '#FF6B35',      // Main orange
  primaryLight: '#FF8C5A', // Lighter orange
  primaryDark: '#E55A2B',  // Darker orange
  // ...
}
```

### Fonts

Replace the font family in `constants/theme.ts`:

```ts
export const FONTS = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
}
```

Then update StyleSheet references to use `fontFamily: FONTS.regular`, etc.

## Screen Previews

### Home Screen
- Greeting with user name
- Search bar with filter
- Promotional banner
- Category quick filters
- Open canteens carousel
- Popular food items grid

### Canteens Screen
- Search and filter (All/Open/Closed)
- Canteen cards with status badges
- Rating, location, delivery time

### Food Menu Screen
- Parallax header with canteen image
- Category chips for filtering
- Food items with add to cart
- Floating cart button

### Cart Screen
- Delivery location selector
- Cart items with quantity controls
- Promo code input
- Order summary
- Checkout button

### Orders Screen
- Active/History tabs
- Order progress tracking
- Order cards with status
- Reorder functionality

## Tips

1. **Images**: Replace Unsplash URLs with your actual food/canteen images
2. **State Management**: Consider using Context API or Redux for cart/orders
3. **API Integration**: Replace mock data with actual API calls
4. **Authentication**: Add login/register screens as needed
5. **Animations**: Add React Native Reanimated for smoother animations

## Support

For questions or issues, contact the SLIIT Eats development team.
