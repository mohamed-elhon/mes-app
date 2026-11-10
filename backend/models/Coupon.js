const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discount: {
    type: Number,
    required: [true, 'Please add a discount value'],
    min: [0, 'Discount cannot be negative']
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Maximum discount cannot be negative']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 0
  },
  usedCount: {
    type: Number,
    default: 0
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
couponSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if coupon is expired
couponSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

// Check if coupon can be used by user
couponSchema.methods.canBeUsed = function(userId) {
  if (!this.isActive || this.isExpired()) {
    return false;
  }
  
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return false;
  }
  
  if (this.users.length > 0 && !this.users.includes(userId)) {
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
