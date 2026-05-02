import AppSettings from "../models/appSettings.js";
import { supabase } from "../config/supabase.js";

const BRANDING_KEY = "branding";

export async function getBranding(req, res) {
    try {
        const branding = await AppSettings.findOne({ key: BRANDING_KEY }).lean();

        res.status(200).json({
            branding: branding || {
                key: BRANDING_KEY,
                appName: "QuickBite",
                logoUrl: "",
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching app branding", error: error.message });
    }
}

export async function updateBranding(req, res) {
    try {
        if (!req.user?.isAdmin && req.user?.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        const updateData = {
            appName: req.body.appName || "QuickBite",
        };

        if (req.file) {
            const fileName = `branding_logo_${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
            const { error } = await supabase.storage
                .from("quickbite-images")
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from("quickbite-images")
                .getPublicUrl(fileName);

            updateData.logoUrl = publicUrlData.publicUrl;
        } else if (typeof req.body.logoUrl === "string") {
            updateData.logoUrl = req.body.logoUrl;
        }

        const branding = await AppSettings.findOneAndUpdate(
            { key: "branding" },
            { $set: updateData, $setOnInsert: { key: "branding" } },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: "App branding updated", branding });
    } catch (error) {
        res.status(500).json({ message: "Error updating app branding", error: error.message });
    }
}
