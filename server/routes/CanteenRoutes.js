const express = require('express');
const router = express.Router();
const {
  createCanteen,
  getAllCanteens,
  getCanteenById,
  updateCanteen,
  deleteCanteen
} = require('../controllers/CanteenController');
const { protect } = require('../middleware/auth');   // provided by auth member
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAllCanteens)
  .post(upload.single('canteenImage'), createCanteen);

router.route('/:id')
  .get(getCanteenById)
  .put(upload.single('canteenImage'), updateCanteen)
  .delete(deleteCanteen);

module.exports = router;