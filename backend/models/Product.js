const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  images: [{
    public_id: String,
    url: String
  }],
  colors: [String],
  sizes: [String],
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  shipping: {
    type: Boolean,
    default: true
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
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating and update numOfReviews
productSchema.statics.calculateAverageRating = async function(productId) {
  const Review = require('./Review');
  
  const result = await Review.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, numOfReviews: { $sum: 1 } } }
  ]);
  
  try {
    await this.findByIdAndUpdate(productId, {
      ratings: result[0]?.averageRating || 0,
      numOfReviews: result[0]?.numOfReviews || 0
    }, { new: true, runValidators: true });
  } catch (error) {
    console.error(error);
  }
};

module.exports = mongoose.model('Product', productSchema);
