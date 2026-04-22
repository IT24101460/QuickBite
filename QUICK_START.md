# 🚀 QuickBite - Quick Start Guide

## Step 1: Start the Backend Server

```bash
# Navigate to server folder
cd server

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ Backend will be running on: `http://localhost:3000`

---

## Step 2: Start the Frontend

In a **new terminal**:

```bash
# Navigate to client folder
cd client/QuickBite

# Install dependencies (first time only)
npm install

# Start Metro bundler
npm start
```

✅ Metro will ask to select platform when ready

---

## Step 3: Run the App

### For Android Emulator
In a **third terminal**:
```bash
cd client/QuickBite
npm run android
```

### For iOS Simulator
```bash
cd client/QuickBite
npm run ios
```

### For Physical Device
1. Change API URL in `src/services/api.js` to your machine's IP
2. Make sure device is on same WiFi as your machine
3. Run the app with emulator command above

---

## Step 4: Login to the App

Use these credentials:
- **Email**: demo@example.com
- **Password**: password123

Or create a new account via Sign Up screen.

---

## 📱 App Features

### Home Screen
- Browse food menu
- See prices and descriptions
- Quick access to orders and feedback

### Order Screen
- Select food items
- Adjust quantity
- Place orders
- View order history with status

### Feedback Screen
- Rate the canteen (1-5 stars)
- Write comments
- Submit feedback

### Account
- Login/Signup
- Logout from home screen

---

## 🔧 API Endpoints Quick Reference

### Test in Postman

#### 1. Login
```
POST http://localhost:3000/users/login
Body: {
  "email": "demo@example.com",
  "password": "password123"
}
```

#### 2. Get Food Items
```
GET http://localhost:3000/foods
```

#### 3. Place Order (with token)
```
POST http://localhost:3000/orders
Headers: 
  Authorization: Bearer <your_token>
Body: {
  "foodItemId": "item_id",
  "quantity": 2
}
```

#### 4. Submit Feedback (with token)
```
POST http://localhost:3000/feedback
Headers:
  Authorization: Bearer <your_token>
Body: {
  "rating": 5,
  "comment": "Great service!"
}
```

---

## 🚨 Troubleshooting

### App won't connect to backend
- ✓ Check backend is running on port 3000
- ✓ Verify API URL in `src/services/api.js`
- ✓ For Android: Use `10.0.2.2:3000`
- ✓ For Physical Device: Use your machine IP

### "Cannot find module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use
```bash
# Kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### MongoDB connection error
- ✓ Check internet connection
- ✓ Verify MongoDB Atlas cluster is running
- ✓ Check IP is whitelisted in MongoDB Atlas

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| `src/navigation/AppNavigator.jsx` | App navigation structure |
| `src/screens/LoginScreen.jsx` | Login page |
| `src/screens/HomeScreen.jsx` | Home/menu page |
| `src/services/api.js` | API configuration |
| `server/server.js` | Backend server config |
| `server/routes/*.js` | API endpoints |

---

## 📸 Screenshots Expected

1. **Login Screen** - Email/password fields + login button
2. **Home Screen** - Food menu with prices
3. **Order Screen** - Place orders, view history
4. **Feedback Screen** - Rate and comment
5. **Sign Up Screen** - Create new account

---

## 💡 Tips

- Use Postman to test API endpoints
- Check browser console for frontend errors
- Check terminal for backend errors
- Use `console.log()` to debug
- Restart Metro bundler if changes don't reflect

---

## ✅ Success Indicators

If everything works:
- ✓ App loads without errors
- ✓ Can login with demo credentials
- ✓ Can see food menu on home screen
- ✓ Can place orders
- ✓ Can submit feedback
- ✓ Can logout and login again

---

## 📞 Need Help?

1. Check **SETUP_GUIDE.md** for detailed setup
2. Check **IMPLEMENTATION_SUMMARY.md** for feature list
3. Read the console/terminal output for error messages
4. Verify all dependencies are installed

---

**Enjoy using QuickBite! 🍔**
