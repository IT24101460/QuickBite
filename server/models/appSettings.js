import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true, default: "branding" },
        appName: { type: String, default: "QuickBite" },
        logoUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);
export default AppSettings;
