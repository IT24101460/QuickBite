import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import User from "./models/user.js";
import Canteen from "./models/Canteen.js";
import FoodItem from "./models/foodItems.js";
import Promotions from "./models/promotions.js";

const MongodbURI = "mongodb+srv://admin:admin123@cluster0.jo7gf4n.mongodb.net/?appName=Cluster0";

async function seed() {
    await mongoose.connect(MongodbURI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Make the student an admin
    const adminUser = await User.findOneAndUpdate(
        { email: "student@university.edu" },
        { isAdmin: true, role: "admin" },
        { new: true }
    );
    if (adminUser) {
        console.log("✅ Admin set successfully for: student@university.edu");
    } else {
        console.log("⚠️ Admin user not found in DB. Did you use a different email?");
    }

    // 2. Create 2 Owner Users
    const passwordHash = await bcrypt.hash("owner123", 10);

    // Clear scoped items for a clean slate
    await User.deleteMany({ email: { $in: ["owner1@canteen.com", "owner2@canteen.com"] } });
    await Canteen.deleteMany({ canteenName: { $in: ["QuickBites Main", "Sunny Cafe"] } });
    await FoodItem.deleteMany({ foodItemId: { $in: ["f1", "f2", "f3", "f4", "f5", "f6"] } });
    await Promotions.deleteMany({ title: "Welcome Mega Sale!" });

    const owner1 = await User.create({
        firstName: "John",
        lastName: "Owner",
        email: "owner1@canteen.com",
        password: passwordHash,
        uniId: "O001",
        phoneNumber: 771234567,
        role: "owner"
    });

    const owner2 = await User.create({
        firstName: "Sarah",
        lastName: "Owner",
        email: "owner2@canteen.com",
        password: passwordHash,
        uniId: "O002",
        phoneNumber: 779876543,
        role: "owner"
    });
    console.log("✅ Owners created (owner1@canteen.com & owner2@canteen.com, pass: owner123)");

    // 3. Create 2 Canteens
    const canteen1 = await Canteen.create({
        canteenName: "QuickBites Main",
        createdBy: owner1._id,
        location: "Block A Ground Floor",
        openingTime: "08:00 AM",
        closingTime: "05:00 PM",
        contactDetails: "0771234567",
        ownerDetails: "John Owner - Head Chef",
        bankDetails: "Bank: BOC\nAcc: 11112222\nName: John Owner"
    });

    const canteen2 = await Canteen.create({
        canteenName: "Sunny Cafe",
        createdBy: owner2._id,
        location: "Engineering Faculty",
        openingTime: "09:00 AM",
        closingTime: "06:00 PM",
        contactDetails: "0779876543",
        ownerDetails: "Sarah Owner - Operations",
        bankDetails: "Bank: HNB\nAcc: 99998888\nName: Sarah Owner"
    });
    console.log("✅ Canteens created");

    // 4. Add foods for Canteen 1
    await FoodItem.create([
        {
            foodItemId: "f1",
            name: "Chicken Fried Rice",
            category: "Rice",
            price: 450,
            canteenId: canteen1._id,
            description: "Delicious spicy chicken fried rice"
        },
        {
            foodItemId: "f2",
            name: "Iced Milo",
            category: "Drinks",
            price: 150,
            canteenId: canteen1._id,
            description: "Cold refreshing milo"
        },
        {
            foodItemId: "f3",
            name: "Cheese Kottu",
            category: "Noodles",
            price: 600,
            canteenId: canteen1._id,
            description: "Heavy loaded cheese kottu"
        }
    ]);

    // Add foods for Canteen 2
    await FoodItem.create([
        {
            foodItemId: "f4",
            name: "Egg Rice & Curry",
            category: "Rice",
            price: 250,
            canteenId: canteen2._id
        },
        {
            foodItemId: "f5",
            name: "Fresh Orange Juice",
            category: "Drinks",
            price: 200,
            canteenId: canteen2._id
        },
        {
            foodItemId: "f6",
            name: "Spicy Noodles",
            category: "Noodles",
            price: 350,
            canteenId: canteen2._id
        }
    ]);
    console.log("✅ Food categories (Rice, Drinks, Noodles) created for both canteens");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    await Promotions.create({
        title: "Welcome Mega Sale!",
        description: "10% off on your orders at QuickBites Main",
        discountType: "percentage",
        discountValue: 10,
        canteenId: canteen1._id,
        startDate: new Date(),
        endDate: tomorrow,
        isActive: true
    });
    console.log("✅ Custom live Promotion created!");

    console.log("🚀 Database seeded successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
