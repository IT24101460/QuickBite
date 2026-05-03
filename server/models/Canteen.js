import mongoose from 'mongoose';

const canteenSchema = new mongoose.Schema({
  canteenName: {
    type: String,
    required: [true, 'Canteen name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  contactDetails: {
    type: String,
    required: [true, 'Contact details are required']
  },
  ownerDetails: {
    type: String,
    required: [true, 'Owner details are required']
  },
  openingTime: {
    type: String,       // e.g. "08:00 AM"
    required: true
  },
  closingTime: {
    type: String,
    required: true
  },
  bankDetails: {
    type: String,
    default: ''
  },
  canteenImage: {
    type: String,       // URL of uploaded image
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Canteen = mongoose.model('Canteen', canteenSchema);

export default Canteen;