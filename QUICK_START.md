# Quick Start Guide

## 🚀 Run Everything in 3 Steps

### Step 1: Backend Server (Terminal 1)
```bash
cd server
npm install  # First time only
npm start
```
✅ Running on: **http://localhost:3000**

---

### Step 2: Web App (Terminal 2)
```bash
cd client
npm install  # First time only
npm run dev
```
✅ Running on: **http://localhost:3000** (or 3001 if port 3000 in use)

---

### Step 3: Mobile App (Terminal 3)
```bash
cd public/react-native-screens
npm install  # First time only
npx expo start
```
✅ Running on: **http://localhost:19000**

**Options:**
- Press `a` → Android Emulator
- Press `i` → iOS Simulator  
- Press `w` → Web Browser
- Scan QR → Expo Go App on Phone

---

## 📋 Command Reference

| Application | Start Command | Port | Type |
|------------|---------------|------|------|
| Backend | `cd server && npm start` | 3000 | Node.js |
| Web | `cd client && npm run dev` | 3000/3001 | Next.js |
| Mobile | `cd public/react-native-screens && npx expo start` | 19000 | React Native |

---

## ✅ Verify All Running

```bash
# Test Backend
curl http://localhost:3000/foodItem

# Test Web App
# Open browser: http://localhost:3000

# Test Mobile App  
# Scan QR code shown in Terminal 3
```

---

## 🔧 First Time Setup

```bash
# Backend
cd server
npm install

# Web App
cd ../client
npm install

# Mobile App
cd ../public/react-native-screens
npm install
```

Then run the 3 commands above in separate terminals!

---

## 💡 Pro Tips

1. **Keep all 3 terminals open** while working
2. **Backend MUST run first** - others depend on it
3. **Changes auto-reload** - no need to restart
4. **Use real iPhone/Android phone** - scan QR code with Expo Go

**All set! Happy coding! 🎉**