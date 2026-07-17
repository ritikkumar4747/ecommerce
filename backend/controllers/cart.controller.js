import Cart from "../models/cart.models.js";
import Product from "../models/product.models.js";

// Helper to recalculate cart total using database product prices
const recalculateTotalPrice = async (cart) => {
    const productIds = cart.items.map(item => item.productId);
    const productsList = await Product.find({ _id: { $in: productIds } });
    const priceMap = {};
    productsList.forEach(p => {
        priceMap[p._id.toString()] = p.price;
    });
    cart.totalPrice = cart.items.reduce((sum, it) => {
        const price = priceMap[it.productId.toString()] || 0;
        return sum + price * it.quantity;
    }, 0);
};

// Add to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            const totalPrice = product.price * quantity;
            cart = await Cart.create({
                userId,
                items: [{ productId, quantity }],
                totalPrice,
            });
        } else {
            const itemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }

            // Recalculate total price using helper
            await recalculateTotalPrice(cart);
            await cart.save();
        }

        res.json({ message: "Item added to cart", cart });

    } catch (err) {
        console.error('Cart add error', err);
        res.status(500).json({ error: err.message });
    }
};

// Get cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate("items.productId");

        res.json(cart || { items: [], totalPrice: 0 });

    } catch (err) {
        console.error('Get cart error', err);
        res.status(500).json({ error: err.message });
    }
};

//  Remove item
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) return res.status(404).json({ error: "Cart not found" });

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        // Recalculate total price using helper
        await recalculateTotalPrice(cart);
        await cart.save();

        res.json({ message: "Item removed", cart });

    } catch (err) {
        console.error('Remove cart error', err);
        res.status(500).json({ error: err.message });
    }
};

//  Update quantity
export const updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (!item) return res.status(404).json({ error: "Item not found" });

        item.quantity = quantity;

        // Recalculate total price using helper
        await recalculateTotalPrice(cart);
        await cart.save();

        res.json({ message: "Cart updated", cart });

    } catch (err) {
        console.error('Update cart error', err);
        res.status(500).json({ error: err.message });
    }
};