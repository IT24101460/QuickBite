# Secure User Payment Options Implementation Guide

## Overview

This implementation provides secure database storage for user payment options in the School Canteen App. Users can save multiple payment methods (cards, wallets, bank accounts) securely, and use them for future transactions.

## Key Features

✅ **Secure Encryption**: Payment card details encrypted with AES-256-GCM  
✅ **Per-User Storage**: Each user has isolated payment options  
✅ **Multiple Payment Types**: Cards, Wallets, Bank Transfers, Mobile Money  
✅ **Authorization Checks**: Users can only access their own payment options  
✅ **Soft Delete**: Payment options can be archived without data loss  
✅ **Default Payment**: Support for setting a default payment method  
✅ **Validation**: Luhn algorithm validation for card numbers  
✅ **Expiry Tracking**: Automatic validation of card expiry dates  
✅ **Usage Tracking**: Records when payment methods are used  
✅ **PCI-DSS Compliance**: Never stores full card numbers unencrypted  

## New Files Created

### Models
- **`server/models/userPaymentOption.js`** - Database schema for storing user payment options

### Controllers
- **`server/controllers/userPaymentController.js`** - Business logic for payment option CRUD operations

### Routes
- **`server/routes/userPaymentRoutes.js`** - API endpoints for managing payment options

### Utilities
- **`server/utils/paymentEncryption.js`** - Encryption/decryption functions for sensitive data

## Setup Instructions

### 1. Environment Variables

Create or update your `.env` file with the encryption key:

```env
# In production, use a strong 64-character hex string
ENCRYPTION_KEY=<64-character-hex-string>
```

To generate a secure encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Migrations

The new `UserPaymentOption` model is automatically created on first run.

**Optional: Add index to MongoDB for better performance:**

```javascript
db.userPaymentoptions.createIndex({ "userId": 1, "isActive": 1, "isDeleted": 1 })
```

### 3. Server Configuration

The routes are already added to `server.js`. The API endpoints are now available under `/user-payments` route.

## API Endpoints

### User Endpoints (Authenticated)

#### 1. Add Payment Option
```
POST /user-payments
Content-Type: application/json

// Card Example
{
  "paymentType": "card",
  "cardholderName": "John Doe",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "isDefault": true,
  "processor": "custom"
}

// Wallet Example
{
  "paymentType": "wallet",
  "cardholderName": "John Doe",
  "walletProvider": "mpesa",
  "phoneNumber": "+254712345678",
  "accountName": "John Doe",
  "isDefault": false
}

// Bank Transfer Example
{
  "paymentType": "bank_transfer",
  "cardholderName": "John Doe",
  "bankName": "Kenya Commercial Bank",
  "accountName": "John Doe",
  "accountNumber": "1234567890",
  "isDefault": false
}
```

**Response:**
```json
{
  "message": "Card saved successfully",
  "paymentOption": {
    "_id": "507f1f77bcf86cd799439011",
    "paymentType": "card",
    "last4": "1111",
    "cardholderName": "John Doe",
    "isDefault": true,
    "isActive": true,
    "expiryMonth": 12,
    "expiryYear": 2025,
    "display": {
      "type": "card",
      "lastFour": "1111",
      "cardholderName": "John Doe",
      "expiryDisplay": "12/2025"
    }
  }
}
```

#### 2. Get All Payment Options
```
GET /user-payments
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Payment options retrieved",
  "paymentOptions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "paymentType": "card",
      "last4": "1111",
      "isDefault": true,
      "display": { ... }
    }
  ],
  "total": 1
}
```

#### 3. Get Default Payment Option
```
GET /user-payments/default
Authorization: Bearer <token>
```

#### 4. Get Specific Payment Option
```
GET /user-payments/:id
Authorization: Bearer <token>
```

#### 5. Update Payment Option
```
PATCH /user-payments/:id
Content-Type: application/json

{
  "cardholderName": "Updated Name",
  "isActive": true,
  "isDefault": true,
  "billingAddress": {
    "street": "123 Main St",
    "city": "Nairobi",
    "postalCode": "00100",
    "country": "Kenya"
  }
}
```

#### 6. Set as Default Payment Option
```
PATCH /user-payments/:id/set-default
Authorization: Bearer <token>
```

#### 7. Verify Payment Option
```
POST /user-payments/:id/verify
Authorization: Bearer <token>
```

#### 8. Delete Payment Option (Soft Delete)
```
DELETE /user-payments/:id
Authorization: Bearer <token>
```

### Using Saved Payment Options for Transactions

When making a payment, you can now use a saved payment option:

```
POST /payments
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "paymentMethod": "card",           // Optional if using paymentOptionId
  "paymentOptionId": "507f1f77bcf86cd799439012"  // Use saved payment option
}
```

## Security Best Practices

### 1. Encryption Keys
- **Never commit encryption keys to git**
- Store in environment variables or secure key management service
- Rotate keys periodically in production
- Use different keys for development and production

### 2. HTTPS Only
- Always use HTTPS in production
- Set `secure` flag on cookies
- Use HSTS headers

### 3. Validation
- Input validation on all endpoints
- Card number validation using Luhn algorithm
- Expiry date validation
- Phone number format validation

### 4. Access Control
- User can only access their own payment options
- Admins can access any user's payment options via separate endpoint
- All operations require authentication

### 5. Audit Trail
- `lastUsedAt` tracks when payment options are used
- `verifiedAt` tracks when they were verified
- `failedAttempts` tracks failed transaction attempts
- `createdAt` and `updatedAt` timestamps

### 6. Data Protection
- Sensitive data encrypted before storage
- Full card numbers never stored unencrypted
- Encrypted data cannot be read without encryption key
- Soft deletes preserve historical data

## Frontend Integration Example

### React Native Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://your-api.com';

// Save a new card
async function saveCard(cardData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/user-payments`, {
      paymentType: 'card',
      cardholderName: cardData.name,
      cardNumber: cardData.number,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      isDefault: cardData.isDefault
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    return response.data.paymentOption;
  } catch (error) {
    console.error('Error saving card:', error);
    throw error;
  }
}

// Get user's payment options
async function getPaymentOptions() {
  try {
    const response = await axios.get(`${API_BASE_URL}/user-payments`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    return response.data.paymentOptions;
  } catch (error) {
    console.error('Error fetching payment options:', error);
    throw error;
  }
}

// Make payment with saved option
async function makePaymentWithSavedOption(orderId, paymentOptionId) {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments`, {
      orderId,
      paymentOptionId  // Use saved payment option
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error making payment:', error);
    throw error;
  }
}

// Set default payment
async function setDefaultPayment(paymentOptionId) {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/user-payments/${paymentOptionId}/set-default`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      }
    );
    return response.data.paymentOption;
  } catch (error) {
    console.error('Error setting default:', error);
    throw error;
  }
}

// Delete payment option
async function deletePaymentOption(paymentOptionId) {
  try {
    await axios.delete(`${API_BASE_URL}/user-payments/${paymentOptionId}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}
```

## Issues This Solves

### Previous Issue: "Previous users payment options showing"
**Root Cause**: Payment methods were stored in client state and not cleared on logout.

**Solution**: 
- Payment options now stored securely in database per user
- Associated with user ID in database
- Cleared automatically on logout (client state cleared)
- New user login loads their own payment options only

### How It Works:
1. User A logs in, saves card, makes payment
2. User A logs out → User A's payment options remain in database
3. User B logs in → System fetches User B's payment options (empty initially)
4. User B cannot see User A's payment options (different userId in database)
5. Only authenticated users can access their own payment options

## Database Schema Reference

### UserPaymentOption Schema
```javascript
{
  userId: ObjectId,              // Reference to User
  paymentType: String,           // "card", "wallet", "bank_transfer", "mobile_money"
  last4: String,                 // Last 4 digits (masked)
  encryptedData: String,         // Encrypted card/payment details
  cardholderName: String,        // Cardholder/account name
  expiryMonth: Number,           // For cards: 1-12
  expiryYear: Number,            // For cards: 2024-2050
  processorToken: String,        // Token from payment processor
  processor: String,             // "stripe", "paypal", "custom"
  isDefault: Boolean,            // Default payment method
  isActive: Boolean,             // Active/inactive status
  bankName: String,              // For bank transfers
  accountName: String,           // For bank transfers
  walletProvider: String,        // "mpesa", "airtel_money", "mtn"
  phoneNumber: String,           // For wallets
  billingAddress: Object,        // Optional billing address
  metadata: Map,                 // Additional data
  lastUsedAt: Date,              // When last used
  verifiedAt: Date,              // When verified
  failedAttempts: Number,        // Failed transaction attempts
  isDeleted: Boolean,            // Soft delete flag
  createdAt: Date,               // Created timestamp
  updatedAt: Date                // Updated timestamp
}
```

## Troubleshooting

### Payment options not loading for user
- Check if user is authenticated
- Verify user ID is correctly set in token
- Check database connection

### Encryption errors
- Ensure ENCRYPTION_KEY env variable is set
- Verify encryption key format is correct (64-char hex)
- Check Node.js crypto module is available

### Card validation failing
- Ensure card number matches Luhn algorithm
- Check expiry month is 1-12
- Check expiry year is valid and not expired

## Next Steps

1. **Update payment flow UI** to show saved payment options
2. **Add payment method selection** in checkout screen
3. **Implement card verification** with test transactions
4. **Add payment option management** screen in profile
5. **Setup payment processor tokens** (Stripe, PayPal)
6. **Add fraud detection** based on failed attempts
7. **Implement automatic cleanup** of expired cards

## Support & Questions

For issues or questions about this implementation, refer to:
- Backend API documentation
- Security best practices guide
- Payment processor documentation (Stripe, PayPal)
