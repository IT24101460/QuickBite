import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { supabase } from "../config/supabase.js";

const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,49}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

function sanitizeText(value) {
    return typeof value === "string" ? value.trim() : value;
}

function validateOwnerProfileFields({ firstName, lastName, email, phoneNumber }) {
    const errors = [];

    if (!firstName) errors.push("First name is required.");
    else if (!NAME_REGEX.test(firstName)) errors.push("First name can only contain letters, spaces, apostrophes or hyphens (2-50 chars).");

    if (!lastName) errors.push("Last name is required.");
    else if (!NAME_REGEX.test(lastName)) errors.push("Last name can only contain letters, spaces, apostrophes or hyphens (2-50 chars).");

    if (!email) errors.push("Email is required.");
    else if (!EMAIL_REGEX.test(email)) errors.push("Enter a valid email address.");

    if (!phoneNumber) errors.push("Phone number is required.");
    else if (!PHONE_REGEX.test(String(phoneNumber))) errors.push("Phone number must be exactly 10 digits.");

    return errors;
}

export async function createUser(req, res) {

    try {
        const user = await User.findOne({ $or: [{ email: req.body.email }, { uniId: req.body.uniId }] })
        if (user != null) {
            res.status(400).json({ message: "A user with this Email or Student ID already exists in the system!" })
            return;
        }
        // Hash the password
        const passwordHash = await bcrypt.hashSync(req.body.password, 10)

        //new create user
        const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            uniId: req.body.uniId,
            phoneNumber: req.body.phoneNumber,
            password: passwordHash
        })
        await newUser.save()
        res.status(201).json({ message: "User created successfully", user: newUser })
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message })
    }
}

export async function createOwner(req, res) {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can create owners" });
        }

        const ownerPayload = {
            firstName: sanitizeText(req.body.firstName),
            lastName: sanitizeText(req.body.lastName),
            email: sanitizeText(req.body.email)?.toLowerCase(),
            phoneNumber: sanitizeText(req.body.phoneNumber),
        };
        const fieldErrors = validateOwnerProfileFields(ownerPayload);
        if (fieldErrors.length > 0) {
            return res.status(400).json({ message: fieldErrors[0], errors: fieldErrors });
        }

        if (!req.body.password || String(req.body.password).trim().length < 6) {
            return res.status(400).json({ message: "Password is required and must be at least 6 characters." });
        }

        const user = await User.findOne({ email: ownerPayload.email });
        if (user != null) {
            return res.status(400).json({ message: "An owner with this email already exists!" });
        }

        const passwordHash = await bcrypt.hashSync(req.body.password, 10);

        const { firstName, lastName, email, phoneNumber } = req.body;

        // Validations
        const nameRegex = /^[A-Za-z\s]{2,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (!firstName || !lastName || !email || !phoneNumber) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        if (!nameRegex.test(firstName)) {
            return res.status(400).json({ message: "First name must be at least 2 characters and contain only letters" });
        }
        if (!nameRegex.test(lastName)) {
            return res.status(400).json({ message: "Last name must be at least 2 characters and contain only letters" });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
        }

        const newOwner = new User({
            email,
            firstName,
            lastName,
            phoneNumber,
            password: passwordHash,
            role: "owner"
        });

        if (req.body.uniId) {
            newOwner.uniId = req.body.uniId;
        }

        await newOwner.save();
        res.status(201).json({ message: "Owner account created successfully", user: newOwner });
    } catch (error) {
        res.status(500).json({ message: "Error creating owner", error: error.message });
    }
}

export async function getOwners(req, res) {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can view owners" });
        }
        const owners = await User.find({ role: 'owner' }).select('-password');
        res.status(200).json(owners);
    } catch (error) {
        res.status(500).json({ message: "Error fetching owners", error: error.message });
    }
}

//Login authentication for email and password
export async function loginUser(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" })
            return;
        }

        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(404).json({ message: "User not found" })
            return;
        }

        const ispasswordValid = bcrypt.compareSync(password, user.password)
        if (ispasswordValid === true) {
            const token = jwt.sign({
                _id: user._id,
                isAdmin: user.isAdmin,
                role: user.role, // Added explicitly
                isBlocked: user.isBlocked,
                isEmailVerified: user.isEmailVerified,
                image: user.image
            }, "secretkey"
            )
            res.status(200).json({
                message: "Login successful",
                token: token,
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    uniId: user.uniId,
                    phoneNumber: user.phoneNumber,
                    isAdmin: user.isAdmin,
                    role: user.role, // Added explicitly for app navigation
                    image: user.image
                }
            })
        } else {
            res.status(401).json({ message: "Invalid password" })
        }

    } catch (error) {
        res.status(500).json({ message: "Error logging in" })
    }
}

export async function uploadProfilePic(req, res) {
    try {
        const userId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const fileName = `profile_${userId}_${Date.now()}`;
        const { data, error } = await supabase.storage
            .from('quickbite-images')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('quickbite-images')
            .getPublicUrl(fileName);

        const imageUrl = publicUrlData.publicUrl;

        const updatedUser = await User.findByIdAndUpdate(userId, { image: imageUrl }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile picture updated successfully", image: imageUrl });
    } catch (error) {
        res.status(500).json({ message: "Error uploading profile picture", error: error.message });
    }
}

export async function updateUserDetails(req, res) {
    try {
        const userId = req.params.id;
        const updates = { ...req.body };
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Authorization check
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (req.user._id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: You can only update your own profile" });
        }

        const isAdminUpdate = req.user.role === 'admin' && req.user._id !== userId;
        const targetRole = updates.role || currentUser.role;

        // Normalize incoming values before validation and uniqueness checks
        if (updates.firstName !== undefined) updates.firstName = sanitizeText(updates.firstName);
        if (updates.lastName !== undefined) updates.lastName = sanitizeText(updates.lastName);
        if (updates.email !== undefined) updates.email = sanitizeText(updates.email)?.toLowerCase();
        if (updates.phoneNumber !== undefined) updates.phoneNumber = sanitizeText(updates.phoneNumber);

        // Validate individual fields when provided
        if (updates.firstName !== undefined && !NAME_REGEX.test(updates.firstName || "")) {
            return res.status(400).json({ error: "First name can only contain letters, spaces, apostrophes or hyphens (2-50 chars)." });
        }
        if (updates.lastName !== undefined && !NAME_REGEX.test(updates.lastName || "")) {
            return res.status(400).json({ error: "Last name can only contain letters, spaces, apostrophes or hyphens (2-50 chars)." });
        }
        if (updates.email !== undefined && !EMAIL_REGEX.test(updates.email || "")) {
            return res.status(400).json({ error: "Enter a valid email address." });
        }

        // Validations
        const nameRegex = /^[A-Za-z\s]{2,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (updates.firstName && !nameRegex.test(updates.firstName)) {
            return res.status(400).json({ error: "First name must be at least 2 characters and contain only letters." });
        }
        if (updates.lastName && !nameRegex.test(updates.lastName)) {
            return res.status(400).json({ error: "Last name must be at least 2 characters and contain only letters." });
        }
        if (updates.email && !emailRegex.test(updates.email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        // Phone number validation (exactly 10 digits)
        if (updates.phoneNumber !== undefined && !PHONE_REGEX.test(updates.phoneNumber.toString())) {
            return res.status(400).json({ error: "Phone number must be exactly 10 digits." });
        }

        // Admin dashboard owner update: enforce required owner profile fields
        if (isAdminUpdate && targetRole === "owner") {
            const ownerFieldErrors = validateOwnerProfileFields({
                firstName: updates.firstName ?? currentUser.firstName,
                lastName: updates.lastName ?? currentUser.lastName,
                email: updates.email ?? currentUser.email,
                phoneNumber: updates.phoneNumber ?? currentUser.phoneNumber,
            });
            if (ownerFieldErrors.length > 0) {
                return res.status(400).json({ error: ownerFieldErrors[0], errors: ownerFieldErrors });
            }
        }

        // Role-based Registration Number Validation
        if (updates.role === 'student' || (currentUser.role === 'student' && !updates.role)) {
            if (!updates.uniId) {
                return res.status(400).json({ error: "Registration number is required for students." });
            }
            if (!/^[a-zA-Z]{2}\d{8}$/.test(updates.uniId)) {
                return res.status(400).json({ error: "Student registration number must be 2 letters followed by 8 numbers (e.g. IT12345678)." });
            }
        } else {
            // If lecturer or staff, uniId can be empty. If empty, remove it to avoid sparse duplicate key issues
            if (!updates.uniId) {
                updates.uniId = undefined; // Or null, so it doesn't trigger unique index conflicts
            }
        }

        // Uniqueness checks
        if (updates.email && updates.email !== currentUser.email) {
            const emailExists = await User.findOne({ email: updates.email });
            if (emailExists) return res.status(400).json({ error: "This email is already in use by another account." });
        }
        if (updates.uniId && updates.uniId !== currentUser.uniId) {
            const uniIdExists = await User.findOne({ uniId: updates.uniId });
            if (uniIdExists) return res.status(400).json({ error: "This registration number is already in use." });
        }

        // Password change logic
        if (isAdminUpdate && updates.password) {
            // Admin forcefully changing password
            updates.password = await bcrypt.hashSync(updates.password, 10);
            delete updates.newPassword;
            delete updates.currentPassword;
        } else {
            // Normal user changing their own password
            if (updates.newPassword) {
                if (!updates.currentPassword) {
                    return res.status(400).json({ error: "You must enter your current password to change it." });
                }
                const isPasswordValid = await bcrypt.compareSync(updates.currentPassword, currentUser.password);
                if (!isPasswordValid) {
                    return res.status(400).json({ error: "Current password is incorrect." });
                }
                updates.password = await bcrypt.hashSync(updates.newPassword, 10);
                delete updates.newPassword;
                delete updates.currentPassword;
            }

            // Ensure we don't accidentally update password if passed incorrectly as `password` from frontend
            if (req.body.password && !req.body.newPassword && !isAdminUpdate) {
                delete updates.password; // Prevent direct password updates bypassing currentPassword check
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        res.status(200).json({
            message: "User details updated successfully",
            user: {
                _id: updatedUser._id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                uniId: updatedUser.uniId,
                phoneNumber: updatedUser.phoneNumber,
                isAdmin: updatedUser.isAdmin,
                role: updatedUser.role,
                image: updatedUser.image
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "A unique constraint failed (Email or Registration Number already exists)." });
        }
        res.status(500).json({ error: error.message });
    }
}