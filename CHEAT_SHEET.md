# 🎯 SLIIT Eats - Command Cheat Sheet

## 📌 TL;DR - Copy & Paste

### Terminal 1 (Backend):
```bash
cd server && npm start
```

### Terminal 2 (Web):
```bash
cd client && npm run dev
```

### Terminal 3 (Mobile):
```bash
cd public/react-native-screens && npx expo start
```

---

## 🔍 Detailed Commands

### Backend (Node.js + MongoDB)
```bash
# Navigate to backend
cd server

# Install dependencies (first time only)
npm install

# Start development server with auto-restart
npm start

# Or run directly (no auto-restart)
node server.js
```

### Web App (Next.js + React)
```bash
# Navigate to web app
cd client

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Mobile App (React Native + Expo)
```bash
# Navigate to mobile app
cd public/react-native-screens

# Install dependencies (first time only)
npm install

# Start Expo dev server
npx expo start

# Start with Android emulator automatically
npx expo start --android

# Start with iOS simulator automatically (Mac only)
npx expo start --ios

# Start web version
npx expo start --web

# Clear cache and restart
npx expo start --clear
```

---

## 🧪 Testing Commands

### Test Backend API
```bash
# Get all food items
curl http://localhost:3000/foodItem

# Get specific food item
curl http://localhost:3000/foodItem/YOUR_ITEM_ID

# Pretty print response
curl http://localhost:3000/foodItem | python -m json.tool
```

### Test Web App
```bash
# Open in browser
http://localhost:3000
```

### Test Mobile App
```bash
# Scan QR code with:
# - Expo Go app (iOS/Android)
# - Phone camera (iOS 11+)
```

---

## 🔌 API Endpoints

All at: `http://localhost:3000`

```
FOOD ITEMS:
GET    /foodItem           (Get all)
GET    /foodItem/:id       (Get one)
POST   /foodItem           (Create)
PATCH  /foodItem/:id       (Update)
DELETE /foodItem/:id       (Delete)

ORDERS:
GET    /orders             (Get all - Admin)
GET    /orders/my          (Get mine)
GET    /orders/:id         (Get one)
POST   /orders             (Create new)
PATCH  /orders/:id/status  (Update status)
PATCH  /orders/:id/cancel  (Cancel)

USERS:
POST   /users/register     (Register)
POST   /users/login        (Login)
```

---

## 🆘 Troubleshooting

### "Port 3000 already in use"
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "MongoDB connection error"
```bash
# Check internet connection
# Restart server
npm start
```

### "Expo won't start"
```bash
# Clear cache
npx expo start --clear
```

---

## 📊 Startup Checklist

- [ ] Terminal 1: Backend running on port 3000
- [ ] Terminal 2: Web app running (port 3000 or 3001)
- [ ] Terminal 3: Expo server running (port 19000)
- [ ] Can access http://localhost:3000 in browser
- [ ] Can see food items in web app
- [ ] Can scan QR code on phone
- [ ] Mobile app loads on phone

---

## 💾 Quick Reference

| What | Command |
|------|---------|
| Start Backend | `cd server && npm start` |
| Start Web | `cd client && npm run dev` |
| Start Mobile | `cd public/react-native-screens && npx expo start` |
| First setup | `npm install` in each folder |
| Test API | `curl http://localhost:3000/foodItem` |
| Kill port 3000 | `netstat -ano \| findstr :3000` then `taskkill /PID <PID> /F` |
| Clear Expo cache | `npx expo start --clear` |
| View Food Items | `http://localhost:3000` |

---

**Everything running? Try placing an order! 🎉**