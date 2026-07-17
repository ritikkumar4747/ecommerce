import Review from '../models/review.models.js';
import Product from '../models/product.models.js';

export const getReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const name = req.user?.name || req.body.name || 'Anonymous';

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const review = await Review.create({ productId, userId: req.user?._id, name, rating, comment });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
