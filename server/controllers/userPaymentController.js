import UserPaymentOption from "../models/userPaymentOption.js";
import User from "../models/user.js";
import {
    encryptPaymentData,
    decryptPaymentData,
    maskCardNumber,
    getLastFourDigits,
    isCardValid,
    validateLuhn,
    formatCardNumber
} from "../utils/paymentEncryption.js";

/**
 * Add a new payment option for the user
 * POST /user-payments
 */
export async function addPaymentOption(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to add payment options" });
        }

        const { paymentType, cardholderName, last4, ...paymentData } = req.body;

        // Validation
        if (!paymentType || !cardholderName) {
            return res.status(400).json({ 
                message: "Payment type and cardholder name are required" 
            });
        }

        const validTypes = ["card", "wallet", "bank_transfer", "mobile_money"];
        if (!validTypes.includes(paymentType)) {
            return res.status(400).json({ 
                message: `Invalid payment type. Must be one of: ${validTypes.join(", ")}` 
            });
        }

        const userId = req.user._id || req.user.id;

        // Type-specific validation
        if (paymentType === "card") {
            const { cardNumber, expiryMonth, expiryYear } = paymentData;

            if (!cardNumber || !expiryMonth || !expiryYear) {
                return res.status(400).json({ 
                    message: "Card number, expiry month, and year are required" 
                });
            }

            // Validate Luhn algorithm for card number
            if (!validateLuhn(cardNumber)) {
                return res.status(400).json({ 
                    message: "Invalid card number" 
                });
            }

            // Validate expiry
            if (!isCardValid(expiryMonth, expiryYear)) {
                return res.status(400).json({ 
                    message: "Card is expired or invalid expiry date" 
                });
            }

            // Check if this card already exists for the user
            const formatted = formatCardNumber(cardNumber);
            const lastFour = getLastFourDigits(formatted);
            const existing = await UserPaymentOption.findOne({
                userId,
                paymentType: "card",
                last4: lastFour,
                isDeleted: false
            });

            if (existing) {
                return res.status(400).json({ 
                    message: "This card is already saved",
                    details: `A ${paymentType} card ending in ${lastFour} is already in your payment options. Use your existing card or add a different one.`
                });
            }

            // Encrypt sensitive data
            const encrypted = encryptPaymentData({
                cardNumber: formatted,
                cardholderName
            });

            // If this is the first payment method or user wants it as default
            const count = await UserPaymentOption.countDocuments({
                userId,
                isDeleted: false
            });

            const isDefault = paymentData.isDefault || count === 0;

            const paymentOption = new UserPaymentOption({
                userId,
                paymentType: "card",
                last4: lastFour,
                encryptedData: encrypted.encryptedData,
                cardholderName,
                expiryMonth,
                expiryYear,
                processor: paymentData.processor || "custom",
                processorToken: paymentData.processorToken,
                isDefault,
                isActive: true
            });

            await paymentOption.save();

            return res.status(201).json({
                message: "Card saved successfully",
                paymentOption: sanitizePaymentOption(paymentOption)
            });
        }

        if (paymentType === "wallet") {
            const { walletProvider, phoneNumber } = paymentData;

            if (!walletProvider || !phoneNumber) {
                return res.status(400).json({ 
                    message: "Wallet provider and phone number are required" 
                });
            }

            // Check if wallet already exists
            const existing = await UserPaymentOption.findOne({
                userId,
                paymentType: "wallet",
                walletProvider,
                phoneNumber,
                isDeleted: false
            });

            if (existing) {
                return res.status(400).json({ 
                    message: "This wallet is already saved",
                    details: `${walletProvider} account (${phoneNumber}) is already in your payment options. Use your existing wallet or add a different one.`
                });
            }

            const encrypted = encryptPaymentData({ phoneNumber });

            const count = await UserPaymentOption.countDocuments({
                userId,
                isDeleted: false
            });

            const paymentOption = new UserPaymentOption({
                userId,
                paymentType: "wallet",
                last4: phoneNumber.slice(-4),
                encryptedData: encrypted.encryptedData,
                cardholderName: paymentData.accountName || cardholderName,
                walletProvider,
                phoneNumber,
                isDefault: paymentData.isDefault || count === 0,
                isActive: true
            });

            await paymentOption.save();
            return res.status(201).json({
                message: "Wallet saved successfully",
                paymentOption: sanitizePaymentOption(paymentOption)
            });
        }

        if (paymentType === "bank_transfer") {
            const { bankName, accountName, accountNumber } = paymentData;

            if (!bankName || !accountName || !accountNumber) {
                return res.status(400).json({ 
                    message: "Bank name, account name, and account number are required" 
                });
            }

            const existing = await UserPaymentOption.findOne({
                userId,
                paymentType: "bank_transfer",
                bankName,
                accountName,
                isDeleted: false
            });

            if (existing) {
                return res.status(400).json({ 
                    message: "This bank account is already saved",
                    details: `${bankName} account (${accountName}) is already in your payment options. Use your existing account or add a different one.`
                });
            }

            const encrypted = encryptPaymentData({ 
                accountNumber,
                bankName,
                accountName
            });

            const count = await UserPaymentOption.countDocuments({
                userId,
                isDeleted: false
            });

            const paymentOption = new UserPaymentOption({
                userId,
                paymentType: "bank_transfer",
                last4: accountNumber.slice(-4),
                encryptedData: encrypted.encryptedData,
                cardholderName: accountName,
                bankName,
                accountName,
                isDefault: paymentData.isDefault || count === 0,
                isActive: true
            });

            await paymentOption.save();
            return res.status(201).json({
                message: "Bank account saved successfully",
                paymentOption: sanitizePaymentOption(paymentOption)
            });
        }

    } catch (error) {
        console.error("Error adding payment option:", error);
        res.status(500).json({ 
            message: "Error adding payment option", 
            error: error.message 
        });
    }
}

/**
 * Get all payment options for the logged-in user
 * GET /user-payments
 */
export async function getUserPaymentOptions(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const userId = req.user._id || req.user.id;

        const paymentOptions = await UserPaymentOption.find({
            userId,
            isDeleted: false
        }).sort({ isDefault: -1, createdAt: -1 });

        // Sanitize and return
        const sanitized = paymentOptions.map(sanitizePaymentOption);

        res.status(200).json({
            message: "Payment options retrieved",
            paymentOptions: sanitized,
            total: sanitized.length
        });
    } catch (error) {
        console.error("Error fetching payment options:", error);
        res.status(500).json({ 
            message: "Error fetching payment options", 
            error: error.message 
        });
    }
}

/**
 * Get a specific payment option
 * GET /user-payments/:id
 */
export async function getPaymentOption(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const userId = req.user._id || req.user.id;
        const paymentOption = await UserPaymentOption.findById(req.params.id);

        if (!paymentOption || paymentOption.isDeleted) {
            return res.status(404).json({ message: "Payment option not found" });
        }

        // Authorization check
        if (paymentOption.userId.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({
            message: "Payment option retrieved",
            paymentOption: sanitizePaymentOption(paymentOption)
        });
    } catch (error) {
        console.error("Error fetching payment option:", error);
        res.status(500).json({ 
            message: "Error fetching payment option", 
            error: error.message 
        });
    }
}

/**
 * Update a payment option
 * PATCH /user-payments/:id
 */
export async function updatePaymentOption(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const userId = req.user._id || req.user.id;
        const paymentOption = await UserPaymentOption.findById(req.params.id);

        if (!paymentOption || paymentOption.isDeleted) {
            return res.status(404).json({ message: "Payment option not found" });
        }

        // Authorization check
        if (paymentOption.userId.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Update allowed fields only
        const { cardholderName, isDefault, isActive, billingAddress } = req.body;

        if (cardholderName) {
            paymentOption.cardholderName = cardholderName;
        }

        if (isActive !== undefined) {
            paymentOption.isActive = isActive;
        }

        if (billingAddress) {
            paymentOption.billingAddress = billingAddress;
        }

        if (isDefault) {
            // Remove default from other payment options
            await UserPaymentOption.updateMany(
                { userId, _id: { $ne: req.params.id }, isDeleted: false },
                { isDefault: false }
            );
            paymentOption.isDefault = true;
        }

        paymentOption.updatedAt = new Date();
        await paymentOption.save();

        res.status(200).json({
            message: "Payment option updated successfully",
            paymentOption: sanitizePaymentOption(paymentOption)
        });
    } catch (error) {
        console.error("Error updating payment option:", error);
        res.status(500).json({ 
            message: "Error updating payment option", 
            error: error.message 
        });
    }
}

/**
 * Set a payment option as default
 * PATCH /user-payments/:id/set-default
 */
export async function setDefaultPaymentOption(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const userId = req.user._id || req.user.id;
        const paymentOption = await UserPaymentOption.findById(req.params.id);

        if (!paymentOption || paymentOption.isDeleted) {
            return res.status(404).json({ message: "Payment option not found" });
        }

        // Authorization check
        if (paymentOption.userId.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Remove default from other payment options
        await UserPaymentOption.updateMany(
            { userId, _id: { $ne: req.params.id }, isDeleted: false },
            { isDefault: false }
        );

        paymentOption.isDefault = true;
        await paymentOption.save();

        res.status(200).json({
            message: "Default payment option updated",
            paymentOption: sanitizePaymentOption(paymentOption)
        });
    } catch (error) {
        console.error("Error setting default payment option:", error);
        res.status(500).json({ 
            message: "Error setting default payment option", 
            error: error.message 
        });
    }
}

/**
 * Delete a payment option (soft delete)
 * DELETE /user-payments/:id
 */
export async function deletePaymentOption(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const userId = req.user._id || req.user.id;
        const paymentOption = await UserPaymentOption.findById(req.params.id);

        if (!paymentOption || paymentOption.isDeleted) {
            return res.status(404).json({ message: "Payment option not found" });
        }

        // Authorization check
        if (paymentOption.userId.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Soft delete
        paymentOption.isDeleted = true;
        paymentOption.isDefault = false;
        await paymentOption.save();

        // If this was default, set another as default
        const otherOption = await UserPaymentOption.findOne({
            userId,
            isDeleted: false,
            _id: { $ne: req.params.id }
        });

        if (otherOption) {
            otherOption.isDefault = true;
            await otherOption.save();
        }

        res.status(200).json({
            message: "Payment option deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting payment option:", error);
        res.status(500).json({ 
            message: "Error deleting payment option", 
            error: error.message 
        });
    }
}

/**
 * Get default payment option
 * GET /user-payments/default
 */
export async function getDefaultPaymentOption(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const userId = req.user._id || req.user.id;

        const defaultOption = await UserPaymentOption.findOne({
            userId,
            isDefault: true,
            isDeleted: false,
            isActive: true
        });

        if (!defaultOption) {
            return res.status(404).json({ message: "No default payment option set" });
        }

        res.status(200).json({
            message: "Default payment option retrieved",
            paymentOption: sanitizePaymentOption(defaultOption)
        });
    } catch (error) {
        console.error("Error fetching default payment option:", error);
        res.status(500).json({ 
            message: "Error fetching default payment option", 
            error: error.message 
        });
    }
}

/**
 * Sanitize payment option before sending to client
 * Removes encrypted data, returns masked info only
 */
function sanitizePaymentOption(paymentOption) {
    const option = paymentOption.toObject();

    // Remove encrypted data from response
    delete option.encryptedData;

    // Add masked/display information
    option.display = {
        type: option.paymentType,
        lastFour: option.last4
    };

    if (option.paymentType === "card") {
        option.display.cardholderName = option.cardholderName;
        option.display.expiryDisplay = `${String(option.expiryMonth).padStart(2, '0')}/${option.expiryYear}`;
    } else if (option.paymentType === "wallet") {
        option.display.provider = option.walletProvider;
    } else if (option.paymentType === "bank_transfer") {
        option.display.bank = option.bankName;
        option.display.accountName = option.accountName;
    }

    return option;
}

/**
 * Admin: Get all payment options for a specific user
 * GET /admin/user/:userId/payment-options
 */
export async function getUserPaymentOptionsAdmin(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const paymentOptions = await UserPaymentOption.find({
            userId: req.params.userId,
            isDeleted: false
        }).sort({ isDefault: -1, createdAt: -1 });

        const sanitized = paymentOptions.map(sanitizePaymentOption);

        res.status(200).json({
            message: "User payment options retrieved",
            userId: req.params.userId,
            paymentOptions: sanitized,
            total: sanitized.length
        });
    } catch (error) {
        console.error("Error fetching user payment options:", error);
        res.status(500).json({ 
            message: "Error fetching user payment options", 
            error: error.message 
        });
    }
}

/**
 * Record last usage of a payment option
 * Used internally when a payment is made
 */
export async function recordPaymentOptionUsage(paymentOptionId) {
    try {
        await UserPaymentOption.findByIdAndUpdate(
            paymentOptionId,
            { lastUsedAt: new Date() },
            { new: true }
        );
    } catch (error) {
        console.error("Error recording payment option usage:", error);
    }
}

/**
 * Verify a payment option (mark as verified)
 * POST /user-payments/:id/verify
 */
export async function verifyPaymentOption(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const userId = req.user._id || req.user.id;
        const paymentOption = await UserPaymentOption.findById(req.params.id);

        if (!paymentOption || paymentOption.isDeleted) {
            return res.status(404).json({ message: "Payment option not found" });
        }

        // Authorization check
        if (paymentOption.userId.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        paymentOption.verifiedAt = new Date();
        paymentOption.failedAttempts = 0; // Reset failed attempts on verification
        await paymentOption.save();

        res.status(200).json({
            message: "Payment option verified",
            paymentOption: sanitizePaymentOption(paymentOption)
        });
    } catch (error) {
        console.error("Error verifying payment option:", error);
        res.status(500).json({ 
            message: "Error verifying payment option", 
            error: error.message 
        });
    }
}
