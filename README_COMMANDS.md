# 🚀 SLIIT Eats - Complete Commands Reference

## 📚 Available Guides

We've created comprehensive command guides for you:

| File | Purpose |
|------|---------|
| **QUICK_START.md** | 👈 **START HERE** - 5 minute quick setup |
| **COMMANDS.md** | 📖 Detailed explanation of all commands |
| **CHEAT_SHEET.md** | 🎯 Quick copy-paste reference |
| **STARTUP_GUIDE.txt** | 📊 Visual diagram & troubleshooting |
| **START.bat** | 🖱️ Batch file with instructions |

---

## ⚡ Super Quick (30 seconds)

### Open 3 Separate Terminals and run:

**Terminal 1:**
```bash
cd server && npm start
```

**Terminal 2:**
```bash
cd client && npm run dev
```

**Terminal 3:**
```bash
cd public/react-native-screens && npx expo start
```

Done! ✅

---

## 🎯 What to Access

| Link | What |
|------|------|
| http://localhost:3000 | 🌐 Web App |
| scan QR code | 📱 Mobile App |
| http://localhost:3000/foodItem | 📊 Food Items API |

---

## 📋 Complete Command List

### Backend (Port 3000)
```bash
cd server
npm install          # First time setup
npm start            # Start server with auto-reload
node server.js       # Run directly (no auto-reload)
```

### Web App (Port 3000 or 3001)
```bash
cd client
npm install          # First time setup
npm run dev          # Development mode
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Check code quality
```

### Mobile App (Port 19000)
```bash
cd public/react-native-screens
npm install              # First time setup
npx expo start           # Start dev server
npx expo start --android # Open Android emulator
npx expo start --ios     # Open iOS simulator (Mac only)
npx expo start --web     # Open web version
npx expo start --clear   # Clear cache and start
```

---

## 🔧 First Time Setup (One Time)

```bash
# Install backend dependencies
cd server
npm install

# Install web app dependencies
cd ../client
npm install

# Install mobile app dependencies
cd ../public/react-native-screens
npm install

# Now ready to start all 3 apps!
```

---

## ✅ Checklist Before Starting

- [ ] 3 separate terminals open
- [ ] Backend will use port 3000
- [ ] Web app will use port 3000 or 3001
- [ ] Mobile app will use port 19000
- [ ] Internet connection for MongoDB
- [ ] Node.js & npm installed

---

## 🧪 Testing After Startup

### Test Backend
```bash
curl http://localhost:3000/foodItem
# Should return 16 food items
```

### Test Web App
Open: `http://localhost:3000` in browser
Should see: Dashboard with food items

### Test Mobile App
Scan QR code from Terminal 3 with Expo Go app
Should see: React Native app on phone

---

## 🔌 API Endpoints

```
GET    /foodItem           - List all food items
GET    /foodItem/:id       - Get specific item
POST   /orders             - Place order
GET    /orders/my          - Our orders
PATCH  /orders/:id/status  - Update order status
POST   /users/register     - Register user
POST   /users/login        - Login user
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `netstat -ano \| findstr :3000` then kill process |
| Module not found | Delete node_modules + run `npm install` again |
| MongoDB error | Check internet, restart server |
| Expo won't start | Run `npx expo start --clear` |

---

## 💡 Pro Tips

1. **Keep all 3 terminals open** while developing
2. **Backend MUST run first** - others depend on it  
3. **Auto-reload enabled** - changes update automatically
4. **Use real phone** - Scan QR code for best testing
5. **Check each terminal** for any error messages

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│       SLIIT Eats Application            │
├─────────────────────────────────────────┤
│                                         │
│  Backend (Node.js)      ← MongoDB       │
│     │                                   │
│     ├─→ Web App (Next.js) → Browser     │
│     │                                   │
│     └─→ Mobile App (Expo) → Phone       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Your Next Steps

1. ✅ Run `cd server && npm start`
2. ✅ Run `cd client && npm run dev` (new terminal)
3. ✅ Run `cd public/react-native-screens && npx expo start` (new terminal)
4. ✅ Open http://localhost:3000 in browser
5. ✅ Scan QR code on your phone
6. ✅ Try placing an order!

---

## 📞 Still Confused?

- Read **QUICK_START.md** for 5-minute guide
- Read **CHEAT_SHEET.md** for command copy-paste
- Read **STARTUP_GUIDE.txt** for diagrams
- Watch terminals for error messages

---

## 🎉 Ready?

Pick your starting guide and start building! All 3 apps running = **Full Stack Ready!**

```
Happy Coding! 🚀
```