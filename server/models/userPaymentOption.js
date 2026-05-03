import mongoose from "mongoose";

const userPaymentOptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        // Payment method type: card, wallet, bank, mobile
        paymentType: {
            type: String,
            enum: ["card", "wallet", "bank_transfer", "mobile_money"],
            required: true
        },
        // Masked/last 4 digits only (never store full card number)
        last4: {
            type: String,
            required: true
        },
        // Encrypted card/payment details (stored securely)
        encryptedData: {
            type: String,
            required: true
        },
        // Card holder name
        cardholderName: {
            type: String,
            required: true
        },
        // For cards: expiry month (1-12)
        expiryMonth: {
            type: Number,
            min: 1,
            max: 12
        },
        // For cards: expiry year
        expiryYear: {
            type: Number,
            min: 2024,
            max: 2050
        },
        // Payment processor token (Stripe, PayPal token, etc.)
        // This is safer than storing raw card data
        processorToken: {
            type: String,
            required: false
        },
        // Payment processor (stripe, paypal, etc.)
        processor: {
            type: String,
            enum: ["stripe", "paypal", "custom"],
            default: "custom"
        },
        // Is this the default payment method
        isDefault: {
            type: Boolean,
            default: false
        },
        // Is this payment method active
        isActive: {
            type: Boolean,
            default: true
        },
        // Bank details for bank transfer (encrypted)
        bankName: {
            type: String
        },
        accountName: {
            type: String
        },
        // Mobile wallet details
        walletProvider: {
            type: String,
            enum: ["mpesa", "airtel_money", "mtn", "none"],
            default: "none"
        },
        phoneNumber: {
            type: String
        },
        // Billing address (optional)
        billingAddress: {
            street: String,
            city: String,
            postalCode: String,
            country: String
        },
        // Additional metadata
        metadata: {
            type: Map,
            of: String,
            default: new Map()
        },
        // Track when this payment method was last used
        lastUsedAt: {
            type: Date
        },
        // For security: track if this method was recently verified
        verifiedAt: {
            type: Date
        },
        // Track failed attempts (to detect fraud)
        failedAttempts: {
            type: Number,
            default: 0
        },
        // Soft delete flag
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1, isActive: 1, isDeleted: 1 }
        ]
    }
);

// Ensure only one default payment method per user
userPaymentOptionSchema.pre('save', async function(next) {
    if (this.isDefault && !this.isDeleted) {
        // Remove default flag from other payment methods for this user
        await this.constructor.updateMany(
            { 
                userId: this.userId, 
                _id: { $ne: this._id },
                isDeleted: false 
            },
            { isDefault: false }
        );
    }
    next();
});

const UserPaymentOption = mongoose.model("UserPaymentOption", userPaymentOptionSchema);

export default UserPaymentOption;
