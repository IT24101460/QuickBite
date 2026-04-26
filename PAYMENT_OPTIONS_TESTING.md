# Payment Options Implementation - Testing Guide

## Testing Checklist

### 1. Setup
- [ ] Generate encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Add ENCRYPTION_KEY to `.env` file
- [ ] Restart backend server
- [ ] Verify no errors in server logs

### 2. Unit Tests - Manual Testing with cURL/Postman

#### Test 2.1: Add Card Payment Option
```bash
curl -X POST http://localhost:3000/user-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "paymentType": "card",
    "cardholderName": "John Doe",
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025
  }'
```

**Expected Result:**
- Status: 201 Created
- Card saved with masked last 4 digits
- Data encrypted in database

#### Test 2.2: Get All Payment Options
```bash
curl -X GET http://localhost:3000/user-payments \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected Result:**
- Status: 200 OK
- Returns array of payment options for user
- No full card numbers in response

#### Test 2.3: Add Wallet Payment Option
```bash
curl -X POST http://localhost:3000/user-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "paymentType": "wallet",
    "cardholderName": "Jane Doe",
    "walletProvider": "mpesa",
    "phoneNumber": "+254712345678",
    "accountName": "Jane Doe"
  }'
```

#### Test 2.4: Set Default Payment Option
```bash
curl -X PATCH http://localhost:3000/user-payments/<PAYMENT_OPTION_ID>/set-default \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected Result:**
- Status: 200 OK
- Only this option marked as default
- Other options no longer default

#### Test 2.5: Get Default Payment Option
```bash
curl -X GET http://localhost:3000/user-payments/default \
  -H "Authorization: Bearer <USER_TOKEN>"
```

#### Test 2.6: Make Payment Using Saved Option
```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "orderId": "<ORDER_ID>",
    "paymentOptionId": "<PAYMENT_OPTION_ID>"
  }'
```

**Expected Result:**
- Status: 201 Created
- Payment created using saved option
- `lastUsedAt` updated on payment option

#### Test 2.7: Delete Payment Option
```bash
curl -X DELETE http://localhost:3000/user-payments/<PAYMENT_OPTION_ID> \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected Result:**
- Status: 200 OK
- Payment option soft deleted
- If it was default, another becomes default

### 3. Security Tests

#### Test 3.1: Encryption Verification
**Steps:**
1. Save a card via API
2. Query MongoDB directly:
```javascript
db.userPaymentoptions.findOne()
```

**Expected Result:**
- `encryptedData` field contains encrypted string (format: `hex:hex:hex`)
- Field is not readable plain text
- Cannot decrypt without ENCRYPTION_KEY

#### Test 3.2: User Isolation
**Steps:**
1. Login as User A, save card A
2. Logout and login as User B
3. Fetch payment options as User B

**Expected Result:**
- User B only sees their own payment options
- Cannot access User A's saved cards
- Returns empty array if User B has no saved options

#### Test 3.3: Card Validation
**Test invalid card number:**
```bash
curl -X POST http://localhost:3000/user-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "paymentType": "card",
    "cardholderName": "Test User",
    "cardNumber": "1234567890123456",
    "expiryMonth": 12,
    "expiryYear": 2025
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Invalid card number"

#### Test 3.4: Expired Card Detection
```bash
curl -X POST http://localhost:3000/user-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "paymentType": "card",
    "cardholderName": "Test User",
    "cardNumber": "4111111111111111",
    "expiryMonth": 1,
    "expiryYear": 2024
  }'
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Card is expired or invalid expiry date"

#### Test 3.5: Authorization Check
**Steps:**
1. Get payment option ID for User A
2. Login as User B
3. Try to access User A's payment option:

```bash
curl -X GET http://localhost:3000/user-payments/<USER_A_OPTION_ID> \
  -H "Authorization: Bearer <USER_B_TOKEN>"
```

**Expected Result:**
- Status: 403 Forbidden
- Error: "Access denied"

#### Test 3.6: Duplicate Card Detection
**Steps:**
1. Save card with number 4111111111111111
2. Try to save the same card again

**Expected Result:**
- Status: 400 Bad Request
- Error: "This card is already saved in your payment options"

### 4. Integration Tests

#### Test 4.1: Profile Payment Options Display
**Steps:**
1. Add 2 cards via API
2. Open profile screen
3. Check payment options display

**Expected Result:**
- Both cards display with masked last 4 digits
- Default card marked clearly
- No sensitive data visible

#### Test 4.2: Checkout Flow
**Steps:**
1. Add payment option
2. Create order
3. Go to checkout
4. Select saved payment option
5. Complete payment

**Expected Result:**
- Saved option loads correctly
- Payment completes successfully
- Order status updates

#### Test 4.3: Multiple Users Simultaneously
**Steps:**
1. Open app in 2 browsers with different users
2. Each user adds different cards
3. Check each sees only their cards

**Expected Result:**
- User isolation maintained
- No data leakage between users
- Each user's options independent

### 5. Database Tests

#### Check encryption is working:
```javascript
// MongoDB
db.userPaymentoptions.findOne({})

// Expected output has encryptedData like: "a1b2c3d4:e5f6g7h8:i9j0k1l2m3n4o5p6..."
```

#### Check user association:
```javascript
db.userPaymentoptions.find({userId: ObjectId("<USER_ID>")})
```

#### Check default flag:
```javascript
db.userPaymentoptions.findOne({isDefault: true})
```

### 6. Performance Tests

#### Load test - Add 100 payment options:
```javascript
for(let i = 0; i < 100; i++) {
  // Add payment option via API
}
```

**Expected Result:**
- All requests complete within 2 seconds
- No database lock issues
- Memory usage stable

#### Query test - Get all options with indexes:
```bash
time curl http://localhost:3000/user-payments
```

**Expected Result:**
- Response time < 100ms with proper indexes
- Verify indexes are being used

## Test Data

### Valid Test Cards
- **Visa**: `4111111111111111`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`

### Test Wallets
- **M-Pesa**: `+254712345678`
- **Airtel Money**: `+254703456789`

### Test Bank Accounts
- **Bank**: "Kenya Commercial Bank"
- **Account**: "1234567890"

## Debugging

### Enable debug logging in controller:
```javascript
console.log("Payment option:", paymentOption);
console.log("Encrypted data:", encrypted);
```

### Check encryption/decryption:
```javascript
const { encryptPaymentData, decryptPaymentData } = require('./paymentEncryption');
const encrypted = encryptPaymentData({cardNumber: '4111111111111111'});
console.log(encrypted);
const decrypted = decryptPaymentData(encrypted.encryptedData);
console.log(decrypted);
```

### Verify token in requests:
```bash
# Check if token is valid
curl -X GET http://localhost:3000/user-payments \
  -H "Authorization: Bearer <TOKEN>" \
  -v
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No token or invalid token | Add valid JWT token to header |
| 403 Access Denied | Trying to access other user's data | Use own payment option ID |
| Encryption error | ENCRYPTION_KEY not set | Set ENCRYPTION_KEY in .env |
| Duplicate card error | Card already saved | Use different card number |
| Card validation failed | Invalid Luhn checksum | Use valid test card |
| 404 Not found | Payment option doesn't exist | Use correct payment option ID |

## Success Criteria

All tests should pass:
- ✅ Cards saved with encryption
- ✅ User isolation maintained
- ✅ Authorization checks working
- ✅ Data validated correctly
- ✅ Payment options used in transactions
- ✅ No data leakage between users
- ✅ Default payment method works
- ✅ Soft delete preserves history
