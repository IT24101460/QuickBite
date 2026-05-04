import Canteen from "../models/Canteen.js";
import { supabase } from "../config/supabase.js";

// Create a new canteen (Admin only)
export async function createCanteen(req, res) {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { canteenName, location, contactDetails, ownerDetails, openingTime, closingTime } = req.body;

    // 🛡️ VALIDATION: Server-side check - contactDetails must be exactly 10 digits
    if (contactDetails && !/^[0-9]{10}$/.test(contactDetails.trim())) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits.' });
    }

    // Check for duplicate canteen name
    const existingCanteen = await Canteen.findOne({
      canteenName: { $regex: new RegExp(`^${canteenName}$`, 'i') }
    });

    if (existingCanteen) {
      return res.status(409).json({
        message: "A canteen with this name already exists. Please choose a different name."
      });
    }

    let canteenImage = "";
    if (req.file) {
      try {
        const fileName = `canteen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { data, error } = await supabase.storage
          .from('quickbite-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error:', error);
          return res.status(500).json({
            message: "Failed to upload image. Please try again or contact support.",
            details: error.message
          });
        }

        const { data: publicUrlData } = supabase.storage
          .from('quickbite-images')
          .getPublicUrl(fileName);

        canteenImage = publicUrlData.publicUrl;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          message: "Image upload failed. The canteen will be created without an image.",
          error: uploadError.message
        });
      }
    }

    const canteen = new Canteen({
      canteenName: canteenName.trim(),
      location: location.trim(),
      contactDetails: contactDetails.trim(),
      ownerDetails: ownerDetails.trim(),
      openingTime,
      closingTime,
      canteenImage,
      createdBy: req.body.createdBy || req.user._id || req.user.id
    });

    await canteen.save();
    res.status(201).json({ message: "Canteen created successfully", canteen });
  } catch (error) {
    console.error('Canteen creation error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        details: validationErrors
      });
    }

    res.status(500).json({
      message: "Failed to create canteen. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    // Check for duplicate canteen name (if name is being updated)
    if (updateData.canteenName && updateData.canteenName !== canteen.canteenName) {
      const existingCanteen = await Canteen.findOne({
        canteenName: { $regex: new RegExp(`^${updateData.canteenName}$`, 'i') },
        _id: { $ne: req.params.id } // Exclude current canteen
      });

      if (existingCanteen) {
        return res.status(409).json({
          message: "A canteen with this name already exists. Please choose a different name."
        });
      }
    }

    if (req.file) {
      try {
        const fileName = `canteen_${req.params.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { data, error } = await supabase.storage
          .from('quickbite-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error:', error);
          return res.status(500).json({
            message: "Failed to upload image. Please try again or contact support.",
            details: error.message
          });
        }

        const { data: publicUrlData } = supabase.storage
          .from('quickbite-images')
          .getPublicUrl(fileName);

        updateData.canteenImage = publicUrlData.publicUrl;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          message: "Image upload failed. The canteen will be updated without an image.",
          error: uploadError.message
        });
      }
    }

    // Trim string fields
    const trimmedUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (typeof updateData[key] === 'string') {
        trimmedUpdateData[key] = updateData[key].trim();
      } else {
        trimmedUpdateData[key] = updateData[key];
      }
    });

    const updated = await Canteen.findByIdAndUpdate(req.params.id, trimmedUpdateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ message: "Canteen updated successfully", canteen: updated });
  } catch (error) {
    console.error('Canteen update error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        details: validationErrors
      });
    }

    res.status(500).json({
      message: "Failed to update canteen. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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