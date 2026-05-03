# 🍽️ UniEats — Smart Multi-Canteen Pre-Order Management System

> A university canteen pre-ordering platform that eliminates long queues, streamlines food ordering, and empowers canteen owners with real-time management tools.

---

## 🔗 Repository & Deployment

| Resource | Link |
|---|---|
| GitHub Repository | https://github.com/IT24101460/QuickBite |
| Live Backend API | https://quickbite-production-cc3e.up.railway.app |

---

## 👥 Team — WMT_AI_KU_03

| Student ID | Name | Module Responsibility |
|---|---|---|
| IT24101176 | Widumini D.G.N.S. | Order Management |
| IT241013606 | Rathnayake R.M.P.T. | Payment Management |
| IT24101559 | Bandara I.R.G.R.M. | Feedback Management |
| IT24100120 | Ranasinghe K.H. | Canteen Management |
| IT24100382 | Herath H.M.P.C.B. | Food Item Management |
| IT24101460 | Rajapaksha R.D.C.N. | Promotions & Discounts Management |

---

## 📖 About the Project

**UniEats** is a full-stack mobile application built to modernize the food ordering experience at university canteens. Students, lecturers, and staff can browse menus across multiple canteens, pre-order food items, make payments, and track their order status — all from a single app.

On the operations side, canteen owners get a dedicated dashboard to manage their menu, handle incoming orders, create promotional offers, and monitor customer satisfaction through feedback. An administrator oversees the entire ecosystem, managing canteens, users, and system-wide analytics.

**Why UniEats?**
- No more standing in long queues during peak lunch hours
- Students can order ahead and pick up when ready
- Canteen owners can plan and prepare efficiently
- Transparent order tracking with real-time status updates

---

## 🧩 System Modules

### 1. 📦 Order Management
Handles the full lifecycle of a food order — from placement to collection. Each order is assigned a unique queue number, and its status is updated in real time so both the student and the canteen staff stay informed.

### 2. 💳 Payment Management
Supports multiple payment methods including card payments and manual bank transfers. Students can upload payment slips as proof of payment, which are then verified by the canteen owner before the order is confirmed.

### 3. ⭐ Feedback Management
After receiving their order, users can rate their experience and leave a comment. Canteen owners and admins can monitor this feedback to continuously improve service quality.

### 4. 🏪 Canteen Management
Manages all canteen profiles within the university — including location, contact details, and assigned ownership. The system is built to support multiple canteens running independently within one platform.

### 5. 🍔 Food Item Management
Canteen owners can add, update, and remove food items from their menu. Each item includes a name, description, category, price, availability status, and an uploaded image.

### 6. 🏷️ Promotions & Discounts Management
Owners can create promotional campaigns with percentage-based or fixed-amount discounts. Active promotions are displayed as dynamic banners on the home screen, encouraging users to take advantage of current deals.

---

## 🛠️ Technologies Used

### Frontend
- **React Native** (CLI) — Cross-platform mobile development
- **React Navigation** — Drawer, Stack, and Tab navigation
- **React Context API** — Global state for auth, cart, and branding
- **AsyncStorage** — On-device data persistence
- **Axios** — HTTP client for API communication
- **React Native Image Picker** — Camera and gallery access
- **React Native Reanimated** — Smooth UI animations

### Backend
- **Node.js** — Server-side JavaScript runtime
- **Express.js** — RESTful API framework
- **MongoDB Atlas** — Cloud-hosted NoSQL database
- **Mongoose** — Object-document mapping (ODM)
- **Supabase Storage** — Cloud storage for images (food, canteen, profiles)
- **JWT (JSON Web Tokens)** — Secure authentication and session management
- **Multer** — Multipart file upload handling

### DevOps & Tools
- **Railway** — Cloud deployment for the backend server
- **GitHub** — Version control and team collaboration
- **Postman** — API testing and documentation
- **Android Studio** — Android emulation and native builds

---

## 🔌 API Endpoints Overview

| Route | Description |
|---|---|
| `/users` | Registration, login, authentication, and profile management |
| `/canteens` | Create, update, view, and delete canteen profiles |
| `/foods` | Full CRUD for food items and availability |
| `/orders` | Place orders, manage queue, and track order status |
| `/payments` | Payment records, slip uploads, and status updates |
| `/feedback` | Submit and retrieve ratings and comments |
| `/promotions` | Create and apply discount promotions |
| `/reports` | Live analytics for canteen owners (daily stats, revenue, ratings) |
| `/user-payments` | Manage saved card payment methods |
| `/settings` | Admin-controlled app branding (name, logo) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.11.0
- Android Studio (with an emulator configured) or a physical Android device
- MongoDB Atlas account
- Supabase account (for image storage)

---

### 🖥️ Backend Setup

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then fill in your MongoDB URI, JWT secret, and Supabase credentials

# 4. Start the server
npm start
```

The server will start on `http://localhost:3000` by default.

---

### 📱 Frontend Setup

```bash
# 1. Navigate to the mobile app directory
cd client/QuickBite

# 2. Install dependencies
npm install

# 3. Start the Metro Bundler
npm start

# 4. In a separate terminal, run on Android
npm run android
```

> Make sure your Android emulator is running in Android Studio, or connect a physical device with USB debugging enabled before running step 4.

---

## 👤 User Roles

| Role | Capabilities |
|---|---|
| **Student / User** | Register, browse canteens & menus, place pre-orders, make payments, track order status, submit ratings and feedback |
| **Canteen Owner** | Manage canteen profile, add/edit food items, view and process live orders, create promotions, respond to feedback |
| **Admin** | Manage all users and canteens, monitor system activity, view platform-wide reports, configure app branding |

---

## 📁 Submission Information

```
ZIP File Name : WDDS01_Group_WMT_AI_KU_03_Submission.zip
Folder Name   : SE2020_Group_WMT_AI_KU_03_Submission
```

**Files Included:**
- `Problem_Statement.pdf`
- `System_Architecture_Diagram.png`
- `Database_Schema_Diagram.png`
- `API_Endpoint_Table.pdf`
- `Team_Responsibility.pdf`
- `README.txt`

> ⚠️ Source code is not included in the ZIP. All code is available via the GitHub repository link above.

---

*UniEats — Built with ❤️ by Group WMT_AI_KU_03*
