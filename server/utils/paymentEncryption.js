import crypto from "crypto";

// These should be in environment variables in production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

/**
 * Encrypt sensitive payment data
 * @param {Object} data - Data to encrypt (card number, bank details, etc.)
 * @returns {Object} - Encrypted data with IV and auth tag
 */
export function encryptPaymentData(data) {
    try {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(
            ENCRYPTION_ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        const plaintext = JSON.stringify(data);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Return as single string: iv:authTag:encrypted
        return {
            encryptedData: `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt payment data");
    }
}

/**
 * Decrypt sensitive payment data
 * @param {String} encryptedString - Encrypted data string (iv:authTag:encrypted)
 * @returns {Object} - Decrypted data object
 */
export function decryptPaymentData(encryptedString) {
    try {
        const parts = encryptedString.split(':');
        if (parts.length !== 3) {
            throw new Error("Invalid encrypted data format");
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(
            ENCRYPTION_ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Failed to decrypt payment data");
    }
}

/**
 * Mask sensitive payment information for display
 * @param {String} cardNumber - Full card number
 * @returns {String} - Masked card (XXXX XXXX XXXX 1234)
 */
export function maskCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    const last4 = cleaned.slice(-4);
    return `XXXX XXXX XXXX ${last4}`;
}

/**
 * Extract last 4 digits
 * @param {String} cardNumber - Full card number or payment identifier
 * @returns {String} - Last 4 digits
 */
export function getLastFourDigits(cardNumber) {
    return cardNumber.replace(/\D/g, '').slice(-4);
}

/**
 * Validate card expiry date
 * @param {Number} month - Expiry month
 * @param {Number} year - Expiry year
 * @returns {Boolean} - True if not expired
 */
export function isCardValid(month, year) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

/**
 * Validate credit card number using Luhn algorithm
 * @param {String} cardNumber - Card number to validate
 * @returns {Boolean} - True if valid Luhn check
 */
export function validateLuhn(cardNumber) {
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Format card number for storage (spaces removed)
 * @param {String} cardNumber - Card number with spaces
 * @returns {String} - Card number without spaces
 */
export function formatCardNumber(cardNumber) {
    return cardNumber.replace(/\s/g, '');
}
