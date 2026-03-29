# 🚀 Complete Command Guide - SLIIT Eats Project

## 📁 Project Structure
```
school-canteen-app/
├── server/              (Node.js + Express + MongoDB)
├── client/              (Next.js web app)
└── public/
    └── react-native-screens/  (React Native mobile app)
```

---

## 🔧 **STEP 1: Start the Backend Server**

### Open Terminal 1 and run:
```bash
cd server
npm install      # (Only first time)
npm start
```

**Expected Output:**
```
Server started Successfully
Listening on port 3000
Connected to MongoDB successfully !!!
```

✅ **Backend running at:** `http://localhost:3000`

---

## 🌐 **STEP 2: Start the Next.js Web App**

### Open Terminal 2 and run:
```bash
cd client
npm install      # (Only first time)
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

> **Note:** If port 3000 is already in use, Next.js will use port 3001

✅ **Web app running at:** `http://localhost:3000` (or `3001`)

---

## 📱 **STEP 3: Start the React Native Mobile App**

### Open Terminal 3 and run:
```bash
cd public/react-native-screens
npm install      # (Only first time)
npx expo start
```

**Expected Output:**
```
Starting Expo server...
Press a for Android
Press i for iOS
Press w for web
Scan QR code with Expo Go app
```

**To Run on Your Device:**

1. **Android Emulator:**
   ```bash
   # In the Expo terminal, press:
   a
   ```

2. **iOS Simulator (Mac only):**
   ```bash
   # In the Expo terminal, press:
   i
   ```

3. **On Your Phone:**
   - Install **Expo Go** app (Android/iOS)
   - Scan the QR code shown in terminal
   - App loads on your phone!

4. **Web Browser:**
   ```bash
   # In the Expo terminal, press:
   w
   ```

✅ **Mobile app running at:** `http://localhost:19000` (Expo dev server)

---

## 🎯 **All 3 Running Together (Quick Reference)**

### Terminal 1 - Backend:
```bash
cd server && npm start
```

### Terminal 2 - Web App:
```bash
cd client && npm run dev
```

### Terminal 3 - Mobile App:
```bash
cd public/react-native-screens && npx expo start
```

---

## 🧪 **Test Everything is Connected**

### 1. Test Backend
```bash
curl http://localhost:3000/foodItem
```
Should return JSON with 16 food items ✅

### 2. Test Web App
Open browser: `http://localhost:3000`
Should show SLIIT Eats dashboard ✅

### 3. Test Mobile App
Run Expo and scan QR code
Should load React Native app ✅

---

## 📦 **Useful Commands**

### Backend Commands:
| Command | Purpose |
|---------|---------|
| `npm start` | Start server (auto-restarts on changes) |
| `npm install` | Install dependencies |
| `node server.js` | Run without auto-restart |

### Web App Commands:
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check code quality |

### Mobile App Commands:
| Command | Purpose |
|---------|---------|
| `npx expo start` | Start Expo dev server |
| `npx expo start --android` | Start + open Android emulator |
| `npx expo start --ios` | Start + open iOS simulator |
| `npx expo start --web` | Start + open web version |

---

## 🔌 **API Endpoints (Backend)**

All endpoints at `http://localhost:3000`

```
GET    /foodItem           - Get all food items ✅
GET    /foodItem/:id       - Get single food item
POST   /foodItem           - Create new food item (Admin)
PATCH  /foodItem/:id       - Update food item (Admin)
DELETE /foodItem/:id       - Delete food item (Admin)

POST   /orders             - Place new order
GET    /orders             - Get all orders (Admin)
GET    /orders/my          - Get my orders (User)
GET    /orders/:id         - Get order details
PATCH  /orders/:id/status  - Update order status (Admin)
PATCH  /orders/:id/cancel  - Cancel order (User)

POST   /users/register     - Register new user
POST   /users/login        - Login user
```

---

## 🐛 **Troubleshooting**

### Port Already in Use
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error
- Check your internet connection
- Verify MongoDB cluster is running
- Check connection string in `server.js`

### Expo Won't Start
```bash
# Clear cache and restart
npx expo start --clear
```

### Module Not Found Errors
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 **Complete Startup Sequence**

```
1. Terminal 1: npm start (server/)        ← Starts first
2. Terminal 2: npm run dev (client/)       ← Starts second (after server)
3. Terminal 3: npx expo start              ← Starts third (after web app)
```

**All 3 running = Full Application Ready! 🎉**

---

## 💡 **Pro Tips**

1. **Keep all terminals open** while developing
2. **Backend must start first** for web/mobile apps to work
3. **Hot reload** is enabled - changes auto-reload
4. **Check localhost:3000** to see if web app loads
5. **Use QR code** scan for mobile testing on real phone

---

## 🎬 **Next Steps**

After starting:
1. ✅ Browse food items on web/mobile
2. ✅ Add items to cart
3. ✅ Place an order
4. ✅ Check order status
5. ✅ See data in MongoDB

**Happy coding! 🚀**