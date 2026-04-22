# QuickBite - School Canteen Application

A complete React Native application with Express.js backend for managing school canteen orders.

## Project Structure

```
school-canteen-app/
├── client/QuickBite/          # React Native Frontend
│   ├── src/
│   │   ├── screens/          # Screen components
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── SignUpScreen.jsx
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── OrderScreen.jsx
│   │   │   └── FeedbackScreen.jsx
│   │   ├── navigation/        # Navigation setup
│   │   │   └── AppNavigator.jsx
│   │   ├── components/        # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── InputField.jsx
│   │   ├── services/          # API configuration
│   │   │   └── api.js
│   │   └── App.tsx            # Main app entry
│   └── package.json
├── server/                    # Express.js Backend
│   ├── controllers/           # Business logic
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── middleware/           # Middleware functions
│   ├── server.js             # Server entry point
│   └── package.json
└── ReadMe files/             # Documentation
```

## Features

### Frontend (React Native)
- ✅ **Login Screen** - User authentication
- ✅ **Sign Up Screen** - New user registration
- ✅ **Home Screen** - Browse food menu
- ✅ **Order Screen** - Place and track orders
- ✅ **Feedback Screen** - Submit feedback and ratings
- ✅ **Responsive Design** - Works on Android and iOS
- ✅ **Navigation** - Smooth screen transitions
- ✅ **Error Handling** - User-friendly error messages

### Backend (Node.js/Express)
- ✅ **User Management** - Authentication & Authorization
- ✅ **Food Items** - Manage menu items
- ✅ **Orders** - Order processing
- ✅ **Feedback** - Collect user feedback
- ✅ **CORS Enabled** - Frontend-backend communication
- ✅ **MongoDB** - Data persistence

## Setup Instructions

### Backend Setup

1. **Navigate to server folder**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to client folder**
   ```bash
   cd client/QuickBite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

5. **Run on iOS**
   ```bash
   npm run ios
   ```

## API Endpoints

### User Routes (`/users`)
- `POST /users` - Register new user
- `POST /users/login` - Login user

### Food Items (`/foods`)
- `GET /foods` - Get all food items
- `GET /foods/:id` - Get food item by ID
- `POST /foods` - Create food item (Admin)
- `PATCH /foods/:id` - Update food item (Admin)
- `DELETE /foods/:id` - Delete food item (Admin)

### Orders (`/orders`)
- `GET /orders` - Get user's orders
- `POST /orders` - Place new order
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id` - Update order status
- `DELETE /orders/:id` - Cancel order

### Feedback (`/feedback`)
- `GET /feedback` - Get all feedback
- `POST /feedback` - Submit feedback

## Authentication

The app uses JWT (JSON Web Tokens) for authentication:

1. User logs in with email and password
2. Backend returns JWT token
3. Token is sent in Authorization header for protected routes
4. Format: `Authorization: Bearer <token>`

## Database Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  password: String (hashed),
  phoneNumber: String,
  uniId: String,
  isAdmin: Boolean,
  isBlocked: Boolean,
  isEmailVerified: Boolean,
  createdAt: Date
}
```

### Food Item
```javascript
{
  name: String,
  price: Number,
  description: String,
  category: String,
  availability: Boolean,
  createdAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId (User reference),
  foodItemId: ObjectId (Food Item reference),
  quantity: Number,
  totalPrice: Number,
  status: String (Pending, Completed, Cancelled),
  createdAt: Date
}
```

### Feedback
```javascript
{
  userId: String,
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

## Testing the App

### Demo Credentials
- **Email:** demo@example.com
- **Password:** password123

### API Testing
Use Postman or similar tool to test endpoints:

1. **Login**
   ```
   POST http://localhost:3000/users/login
   Body: {
     "email": "demo@example.com",
     "password": "password123"
   }
   ```

2. **Get Foods**
   ```
   GET http://localhost:3000/foods
   ```

3. **Place Order**
   ```
   POST http://localhost:3000/orders
   Headers: Authorization: Bearer <token>
   Body: {
     "foodItemId": "item_id",
     "quantity": 2
   }
   ```

## Important Configuration

### API Base URL
The frontend is configured to connect to `http://10.0.2.2:3000`
- `10.0.2.2` is the special IP for Android emulator to reach localhost
- For physical devices, use your machine's IP address
- For iOS emulator, use `localhost:3000`

To change the API URL, edit `client/QuickBite/src/services/api.js`:
```javascript
const API = axios.create({
  baseURL: 'http://10.0.2.2:3000' // Change this
});
```

### MongoDB Connection
The server uses MongoDB Atlas. Connection URI is in `server/server.js`:
```javascript
const MongodbURI = "mongodb+srv://admin:admin123@cluster0.jo7gf4n.mongodb.net/?appName=Cluster0"
```

## Troubleshooting

### Frontend Connection Issues
- Ensure backend is running on port 3000
- Check if the API base URL matches your setup
- For Android emulator: use `10.0.2.2:3000`
- For physical device: use your machine's IP address (e.g., `192.168.x.x:3000`)

### CORS Errors
- Verify CORS is enabled in `server.js`
- Check that origin is set to "*" for development

### MongoDB Connection Errors
- Verify internet connection
- Check MongoDB Atlas cluster status
- Ensure IP is whitelisted in MongoDB Atlas

## Dependencies

### Frontend
- react-native: 0.84.1
- react-navigation: 7.2.2
- axios: 1.14.0
- typescript: 5.8.3

### Backend
- express: 5.2.1
- mongoose: 9.3.1
- bcrypt: 6.0.0
- jsonwebtoken: 9.0.3
- cors: 2.8.5

## Future Enhancements

- [ ] Push notifications for order updates
- [ ] Payment integration
- [ ] Real-time order tracking
- [ ] User profile management
- [ ] Order history with analytics
- [ ] Admin dashboard
- [ ] Rating and review system
- [ ] Promotional offers

## Support

For issues or questions, please refer to the individual README files:
- Frontend: `ReadMe files/FrontEnd_README.md`
- Backend: `ReadMe files/BackEnd_README.md`

---

**Last Updated:** April 2026
**Version:** 1.0.0
