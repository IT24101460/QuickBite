import Canteen from "../models/Canteen.js";
import { supabase } from "../config/supabase.js";

// Create a new canteen (Admin only)
export async function createCanteen(req, res) {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { canteenName, location, contactDetails, ownerDetails, openingTime, closingTime } = req.body;
    let canteenImage = "";
    if (req.file) {
        const fileName = `canteen_${Date.now()}`;
        const { data, error } = await supabase.storage
            .from('quickbite-images')
            .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
            .from('quickbite-images')
            .getPublicUrl(fileName);
        canteenImage = publicUrlData.publicUrl;
    }

    const canteen = new Canteen({
      canteenName,
      location,
      contactDetails,
      ownerDetails,
      openingTime,
      closingTime,
      canteenImage,
      createdBy: req.body.createdBy || req.user._id || req.user.id
    });

    await canteen.save();
    res.status(201).json({ message: "Canteen created successfully", canteen });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Get all canteens (with optional search)
export async function getAllCanteens(req, res) {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter.canteenName = { $regex: search, $options: "i" };
    }
    const canteens = await Canteen.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ canteens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get single canteen by ID
export async function getCanteenById(req, res) {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ message: "Canteen not found" });
    }
    res.status(200).json({ canteen });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get My Canteens (Owner Specific - multiple)
export async function getAllMyCanteens(req, res) {
  try {
    if (req.user?.role !== 'owner') {
      return res.status(403).json({ message: "Owners only" });
    }
    const canteens = await Canteen.find({ createdBy: req.user._id || req.user.id });
    res.status(200).json({ canteens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get My Canteen (Owner Specific)
export async function getMyCanteen(req, res) {
  try {
    if (req.user?.role !== 'owner') {
      return res.status(403).json({ message: "Owners only" });
    }
    const canteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
    if (!canteen) {
      return res.status(404).json({ message: "No canteen assigned to you" });
    }
    res.status(200).json({ canteen });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update canteen (Admin and Owner)
export async function updateCanteen(req, res) {
  try {
    if (!req.user?.isAdmin && req.user?.role !== "owner") {
      return res.status(403).json({ message: "Admin or Owner access required" });
    }

    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ message: "Canteen not found" });
    }

    if (req.user?.role === 'owner' && canteen.createdBy?.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ message: "You can exclusively edit your own canteen" });
    }

    const updateData = { ...req.body };
    if (req.file) {
        const fileName = `canteen_${req.params.id}_${Date.now()}`;
        const { data, error } = await supabase.storage
            .from('quickbite-images')
            .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
            .from('quickbite-images')
            .getPublicUrl(fileName);
        updateData.canteenImage = publicUrlData.publicUrl;
    }

    const updated = await Canteen.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ message: "Canteen updated successfully", canteen: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete canteen (Admin only)
export async function deleteCanteen(req, res) {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const canteen = await Canteen.findByIdAndDelete(req.params.id);
    if (!canteen) {
      return res.status(404).json({ message: "Canteen not found" });
    }
    res.status(200).json({ message: "Canteen deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}