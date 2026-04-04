const Canteen = require('../models/canteen');

// @desc    Create a new canteennode
// @route   POST /api/canteens
// @access  Owner / Admin
const createCanteen = async (req, res) => {
  try {
    const { canteenName, location, contactDetails, ownerDetails, openingTime, closingTime } = req.body;
    const canteenImage = req.file ? req.file.path : '';

    const canteen = new Canteen({
      canteenName,
      location,
      contactDetails,
      ownerDetails,
      openingTime,
      closingTime,
      canteenImage,
      createdBy: req.user.id   // from auth middleware
    });

    await canteen.save();
    res.status(201).json({ success: true, data: canteen });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all canteens (with optional search)
// @route   GET /api/canteens?search=...
// @access  Public (after login)
const getAllCanteens = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter.canteenName = { $regex: search, $options: 'i' };
    }
    const canteens = await Canteen.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: canteens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single canteen by ID
// @route   GET /api/canteens/:id
const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, message: 'Canteen not found' });
    }
    res.status(200).json({ success: true, data: canteen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update canteen
// @route   PUT /api/canteens/:id
// @access  Owner (only their own) or Admin
const updateCanteen = async (req, res) => {
  try {
    let canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, message: 'Canteen not found' });
    }

    // Check permission: only the owner who created it or admin
    if (canteen.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.canteenImage = req.file.path;
    }

    canteen = await Canteen.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: canteen });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete canteen
// @route   DELETE /api/canteens/:id
// @access  Owner or Admin
const deleteCanteen = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, message: 'Canteen not found' });
    }
    if (canteen.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await canteen.deleteOne();
    res.status(200).json({ success: true, message: 'Canteen removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCanteen,
  getAllCanteens,
  getCanteenById,
  updateCanteen,
  deleteCanteen
};