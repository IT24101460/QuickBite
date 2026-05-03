# UniEats — API Endpoint Table

**Project:** UniEats – Smart Multi-Canteen Pre-Order Management System
**Group:** WMT_AI_KU_03
**Base URL:** `https://quickbite-production-cc3e.up.railway.app`

> All protected endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## 1. Users (`/users`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| POST | `/users` | Register a new student/user account | No | Public |
| POST | `/users/login` | Login and receive a JWT token | No | Public |
| POST | `/users/create-owner` | Create a new canteen owner account | Yes | Admin |
| GET | `/users/owners` | Get all owner accounts | Yes | Admin |
| PUT | `/users/:id/profile-pic` | Upload or update profile picture | Yes | User (Self) |
| PUT | `/users/:id` | Update user details (name, phone, etc.) | Yes | User (Self) |

---

## 2. Canteens (`/canteens`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| GET | `/canteens` | Get all canteens in the system | No | Public |
| GET | `/canteens/my` | Get the single canteen owned by logged-in owner | Yes | Owner |
| GET | `/canteens/my-all` | Get all canteens owned by logged-in owner | Yes | Owner |
| GET | `/canteens/:id` | Get a specific canteen by ID | No | Public |
| POST | `/canteens` | Create a new canteen (with image upload) | Yes | Admin |
| PUT | `/canteens/:id` | Update canteen details (with optional image) | Yes | Admin/Owner |
| DELETE | `/canteens/:id` | Delete a canteen | Yes | Admin |

---

## 3. Food Items (`/foods`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| GET | `/foods` | Get all food items (supports `?canteenId=`, `?category=`, `?search=`) | No | Public |
| GET | `/foods/:id` | Get a food item by its custom food item ID | No | Public |
| GET | `/foods/id/:id` | Get a food item by its MongoDB `_id` | No | Public |
| POST | `/foods` | Add a new food item (with image upload) | Yes | Owner |
| PATCH | `/foods/:id` | Update a food item (with optional image) | Yes | Owner |
| DELETE | `/foods/:id` | Delete a food item | Yes | Owner |

---

## 4. Orders (`/orders`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| POST | `/orders` | Place a new food order (with optional image) | Yes | User |
| GET | `/orders/my` | Get all orders belonging to the logged-in user | Yes | User |
| PATCH | `/orders/:id/cancel` | Cancel a specific order | Yes | User |
| GET | `/orders` | Get all orders in the system (supports `?status=`) | Yes | Admin/Owner |
| GET | `/orders/:id` | Get a single order by ID | Yes | Admin/Owner |
| PATCH | `/orders/:id/status` | Update an order's status (e.g., Pending → Ready) | Yes | Owner |

---

## 5. Payments (`/payments`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| POST | `/payments/create-intent` | Create a Stripe payment intent (card payments) | Yes | User |
| POST | `/payments` | Submit a payment record (with optional proof image) | Yes | User |
| GET | `/payments/my` | Get all payments made by the logged-in user | Yes | User |
| GET | `/payments/order/:orderId` | Get payment details for a specific order | Yes | User/Owner |
| GET | `/payments` | Get all payments in the system | Yes | Admin |
| PATCH | `/payments/:id/status` | Update payment status (Approve/Reject) | Yes | Owner/Admin |
| DELETE | `/payments/:id` | Delete a payment record | Yes | Admin |

---

## 6. Feedback (`/feedbacks`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| POST | `/feedbacks` | Submit a rating, review, or complaint (with optional image) | Yes | User |
| GET | `/feedbacks` | Get all feedback entries | Yes | Admin |
| GET | `/feedbacks/food/:foodItemId` | Get all feedback for a specific food item | No | Public |
| GET | `/feedbacks/canteen/:canteenId` | Get all feedback for a specific canteen | No | Public |
| PUT | `/feedbacks/:id` | Update or respond to a feedback entry | Yes | Admin |
| DELETE | `/feedbacks/:id` | Delete a feedback entry | Yes | Admin |

---

## 7. Promotions (`/promotions`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| GET | `/promotions` | Get all active promotions | No | Public |
| GET | `/promotions/:id` | Get a specific promotion by ID | No | Public |
| POST | `/promotions/apply` | Apply a promotion code to a cart | Yes | User |
| POST | `/promotions` | Create a new promotion (with banner image) | Yes | Owner |
| PUT | `/promotions/:id` | Update promotion details (with optional image) | Yes | Owner |
| PATCH | `/promotions/:id/toggle` | Toggle promotion on/off | Yes | Owner |
| DELETE | `/promotions/:id` | Delete a promotion | Yes | Owner |

---

## 8. Reports (`/reports`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| GET | `/reports/owner-stats?canteenId=` | Get live daily metrics for a canteen (orders, revenue, rating) | Yes | Owner |

---

## 9. User Payment Options (`/user-payments`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| POST | `/user-payments` | Add a new saved payment option (card details) | Yes | User |
| GET | `/user-payments` | Get all saved payment options for the user | Yes | User |
| GET | `/user-payments/default` | Get the user's default payment option | Yes | User |
| GET | `/user-payments/:id` | Get a specific saved payment option | Yes | User |
| PATCH | `/user-payments/:id` | Update a saved payment option | Yes | User |
| PATCH | `/user-payments/:id/set-default` | Set a payment option as the default | Yes | User |
| POST | `/user-payments/:id/verify` | Verify a payment option via OTP | Yes | User |
| DELETE | `/user-payments/:id` | Remove a saved payment option | Yes | User |
| GET | `/user-payments/admin/:userId/payment-options` | Admin: view a specific user's saved payment options | Yes | Admin |

---

## 10. App Settings (`/settings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|:---:|------|
| GET | `/settings/branding` | Get current app branding (name, logo URL) | No | Public |
| PUT | `/settings/branding` | Update app name and/or logo (with image upload) | Yes | Admin |

---

*UniEats – Group WMT_AI_KU_03*
